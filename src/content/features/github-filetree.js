// GitHub File Tree - Simple and bulletproof
export function initGitHubFileTree() {
  if (!window.location.hostname.includes('github.com')) {
    return { cleanup: () => {} };
  }

  if (window.__fileTreeActive) {
    return { cleanup: () => {} };
  }
  window.__fileTreeActive = true;

  let isOpen = false;
  let fileData = null;
  let openFolders = new Set();
  let btn, sidebar, content;

  const icons = {
    'js': '📜', 'jsx': '⚛️', 'ts': '📘', 'tsx': '⚛️',
    'html': '🌐', 'css': '🎨', 'json': '⚙️',
    'md': '📝', 'py': '🐍', 'java': '☕',
    'folder': '📁', 'folderOpen': '📂', 'file': '📄'
  };

  function getIcon(name, isFolder, isOpen) {
    if (isFolder) return isOpen ? icons.folderOpen : icons.folder;
    const ext = name.split('.').pop()?.toLowerCase();
    return icons[ext] || icons.file;
  }

  function init() {
    if (!document.body) {
      setTimeout(init, 100);
      return;
    }
    createUI();
  }

  function createUI() {
    btn = document.createElement('button');
    btn.innerHTML = '📁';
    btn.style.cssText = `position:fixed;top:100px;left:20px;width:50px;height:50px;background:linear-gradient(135deg,#667eea,#764ba2);border:2px solid white;border-radius:50%;color:white;font-size:24px;cursor:pointer;z-index:999999;box-shadow:0 4px 16px rgba(102,126,234,0.6);display:flex;align-items:center;justify-content:center;`;
    btn.onmouseenter = () => btn.style.transform = 'scale(1.1)';
    btn.onmouseleave = () => btn.style.transform = 'scale(1)';
    btn.onclick = toggleSidebar;

    sidebar = document.createElement('div');
    sidebar.style.cssText = `position:fixed;top:0;left:-300px;width:300px;height:100vh;background:#1e1e1e;color:#ccc;z-index:999998;box-shadow:2px 0 8px rgba(0,0,0,0.3);transition:left 0.3s;display:flex;flex-direction:column;font-family:-apple-system,sans-serif;`;

    const header = document.createElement('div');
    header.style.cssText = `padding:12px 16px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;font-weight:600;font-size:12px;display:flex;justify-content:space-between;align-items:center;`;
    header.innerHTML = `<span>📁 FILE TREE</span><button id="gh-close" style="background:none;border:none;color:white;cursor:pointer;font-size:18px;">✕</button>`;

    content = document.createElement('div');
    content.style.cssText = `flex:1;overflow-y:auto;padding:8px 0;`;

    sidebar.appendChild(header);
    sidebar.appendChild(content);
    document.body.appendChild(btn);
    document.body.appendChild(sidebar);

    setTimeout(() => {
      document.getElementById('gh-close').onclick = toggleSidebar;
    }, 100);
  }

  function toggleSidebar() {
    isOpen = !isOpen;
    if (isOpen) {
      sidebar.style.left = '0';
      btn.style.display = 'none';
      if (!fileData) loadFiles();
    } else {
      sidebar.style.left = '-300px';
      btn.style.display = 'flex';
    }
  }

  async function loadFiles() {
    content.innerHTML = '<div style="padding:20px;text-align:center;color:#888;">Loading...</div>';
    try {
      const match = window.location.href.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) throw new Error('Not a repo');
      
      const owner = match[1];
      const repo = match[2].split('?')[0];
      const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('API failed');
      
      const data = await res.json();
      fileData = buildTree(data.tree);
      renderTree();
    } catch (err) {
      content.innerHTML = '<div style="padding:20px;text-align:center;color:#888;">Failed to load</div>';
    }
  }

  function buildTree(items) {
    const root = { name: '/', children: {} };
    items.forEach(item => {
      const parts = item.path.split('/');
      let current = root;
      parts.forEach((part, i) => {
        if (i === parts.length - 1) {
          if (item.type === 'blob') {
            current.children[part] = { name: part, type: 'file', path: item.path };
          } else {
            if (!current.children[part]) {
              current.children[part] = { name: part, type: 'folder', children: {}, path: item.path };
            }
          }
        } else {
          if (!current.children[part]) {
            current.children[part] = { name: part, type: 'folder', children: {}, path: parts.slice(0, i + 1).join('/') };
          }
          current = current.children[part];
        }
      });
    });
    return root;
  }

  function renderTree() {
    content.innerHTML = '';
    function render(node, level = 0) {
      const children = Object.values(node.children || {}).sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      
      children.forEach(child => {
        const isFolder = child.type === 'folder';
        const isExpanded = openFolders.has(child.path);
        
        const item = document.createElement('div');
        item.style.cssText = `padding:6px 8px 6px ${level*16+8}px;cursor:pointer;display:flex;align-items:center;gap:6px;font-size:13px;`;
        item.onmouseenter = () => item.style.background = '#2a2d2e';
        item.onmouseleave = () => item.style.background = 'transparent';
        
        if (isFolder) {
          const chevron = document.createElement('span');
          chevron.textContent = isExpanded ? '▼' : '▶';
          chevron.style.cssText = 'font-size:10px;width:12px;';
          item.appendChild(chevron);
        } else {
          const spacer = document.createElement('span');
          spacer.style.width = '12px';
          item.appendChild(spacer);
        }
        
        const icon = document.createElement('span');
        icon.textContent = getIcon(child.name, isFolder, isExpanded);
        icon.style.fontSize = '16px';
        item.appendChild(icon);
        
        const name = document.createElement('span');
        name.textContent = child.name;
        name.style.flex = '1';
        item.appendChild(name);
        
        item.onclick = (e) => {
          e.stopPropagation();
          if (isFolder) {
            if (openFolders.has(child.path)) {
              openFolders.delete(child.path);
            } else {
              openFolders.add(child.path);
            }
            renderTree();
          } else {
            const match = window.location.href.match(/github\.com\/([^\/]+)\/([^\/]+)/);
            if (match) {
              const owner = match[1];
              const repo = match[2].split('?')[0];
              window.location.href = `https://github.com/${owner}/${repo}/blob/main/${child.path}`;
            }
          }
        };
        
        content.appendChild(item);
        if (isFolder && isExpanded) render(child, level + 1);
      });
    }
    render(fileData);
  }

  init();

  return {
    cleanup: () => {
      if (btn) btn.remove();
      if (sidebar) sidebar.remove();
      window.__fileTreeActive = false;
    }
  };
}
