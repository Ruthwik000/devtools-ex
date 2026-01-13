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
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let btnStartX = 20;
  let btnStartY = 100;

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
    btn.style.cssText = `position:fixed;top:100px;left:20px;width:50px;height:50px;background:linear-gradient(135deg,#3B82F6,#2563EB);border:2px solid #1F2937;border-radius:50%;color:white;font-size:24px;cursor:grab;z-index:999999;box-shadow:0 4px 16px rgba(59,130,246,0.5);display:flex;align-items:center;justify-content:center;transition:transform 0.2s;user-select:none;`;
    
    btn.onmouseenter = () => {
      if (!isDragging) btn.style.transform = 'scale(1.1)';
    };
    btn.onmouseleave = () => {
      if (!isDragging) btn.style.transform = 'scale(1)';
    };
    
    // Dragging functionality
    btn.onmousedown = (e) => {
      isDragging = true;
      btn.style.cursor = 'grabbing';
      btn.style.transition = 'none';
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      const rect = btn.getBoundingClientRect();
      btnStartX = rect.left;
      btnStartY = rect.top;
      e.preventDefault();
    };
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartX;
      const deltaY = e.clientY - dragStartY;
      const newX = btnStartX + deltaX;
      const newY = btnStartY + deltaY;
      btn.style.left = newX + 'px';
      btn.style.top = newY + 'px';
    });
    
    document.addEventListener('mouseup', (e) => {
      if (isDragging) {
        isDragging = false;
        btn.style.cursor = 'grab';
        btn.style.transition = 'transform 0.2s';
        
        // Check if it was just a click (minimal movement)
        const deltaX = Math.abs(e.clientX - dragStartX);
        const deltaY = Math.abs(e.clientY - dragStartY);
        if (deltaX < 5 && deltaY < 5) {
          toggleSidebar();
        }
      }
    });

    sidebar = document.createElement('div');
    sidebar.style.cssText = `position:fixed;top:0;left:-300px;width:300px;height:100vh;background:#111827;color:#E5E7EB;z-index:999998;box-shadow:2px 0 12px rgba(0,0,0,0.5);transition:left 0.3s;display:flex;flex-direction:column;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;border-right:1px solid #374151;`;

    const header = document.createElement('div');
    header.style.cssText = `padding:16px 20px;background:linear-gradient(135deg,#3B82F6,#2563EB);color:white;font-weight:700;font-size:14px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);`;
    header.innerHTML = `<span style="display:flex;align-items:center;gap:8px;"><span style="font-size:18px;">📁</span> FILE TREE</span><button id="gh-close" style="background:rgba(255,255,255,0.2);border:none;color:white;cursor:pointer;font-size:16px;width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;transition:all 0.2s;">✕</button>`;

    content = document.createElement('div');
    content.style.cssText = `flex:1;overflow-y:auto;padding:8px 0;background:#111827;`;
    content.innerHTML += `<style>
      #gh-close:hover {
        background: rgba(239,68,68,0.9) !important;
        transform: scale(1.1);
      }
    </style>`;

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
      const currentLeft = parseInt(btn.style.left) || 20;
      if (currentLeft < 320) {
        btn.style.left = '320px';
      }
      if (!fileData) loadFiles();
    } else {
      sidebar.style.left = '-300px';
    }
  }

  async function loadFiles() {
    content.innerHTML = '<div style="padding:40px 20px;text-align:center;color:#9CA3AF;font-size:13px;">Loading files...</div>';
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
      content.innerHTML = '<div style="padding:40px 20px;text-align:center;color:#EF4444;font-size:13px;">Failed to load files</div>';
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
        item.style.cssText = `padding:8px 12px 8px ${level*16+12}px;cursor:pointer;display:flex;align-items:center;gap:8px;font-size:13px;color:#E5E7EB;transition:all 0.2s;border-radius:6px;margin:2px 8px;`;
        item.onmouseenter = () => {
          item.style.background = '#1F2937';
          item.style.transform = 'translateX(2px)';
        };
        item.onmouseleave = () => {
          item.style.background = 'transparent';
          item.style.transform = 'translateX(0)';
        };
        
        if (isFolder) {
          const chevron = document.createElement('span');
          chevron.textContent = isExpanded ? '▼' : '▶';
          chevron.style.cssText = 'font-size:10px;width:12px;color:#9CA3AF;';
          item.appendChild(chevron);
        } else {
          const spacer = document.createElement('span');
          spacer.style.width = '12px';
          item.appendChild(spacer);
        }
        
        const icon = document.createElement('span');
        icon.textContent = getIcon(child.name, isFolder, isExpanded);
        icon.style.cssText = 'font-size:16px;flex-shrink:0;';
        item.appendChild(icon);
        
        const name = document.createElement('span');
        name.textContent = child.name;
        name.style.cssText = 'flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
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
              const fileUrl = `https://github.com/${owner}/${repo}/blob/main/${child.path}`;
              // Open in new tab so the file tree stays visible
              window.open(fileUrl, '_blank');
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
