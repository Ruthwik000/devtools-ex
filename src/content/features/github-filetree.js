// GitHub File Tree - VS Code-like sidebar for GitHub repositories
export function initGitHubFileTree() {
  console.log('🌲 GitHub File Tree: Initializing...');
  console.log('🌲 Current hostname:', window.location.hostname);
  
  if (!window.location.hostname.includes('github.com')) {
    console.log('🌲 Not on GitHub, skipping initialization');
    return { cleanup: () => {} };
  }

  console.log('🌲 On GitHub! Creating sidebar...');
  
  let sidebar = null;
  let isCollapsed = false;
  let fileTreeData = null;

  // Material Design Icons mapping for file extensions
  const fileIcons = {
    // JavaScript/TypeScript
    'js': { icon: '📜', color: '#f7df1e' },
    'jsx': { icon: '⚛️', color: '#61dafb' },
    'ts': { icon: '📘', color: '#3178c6' },
    'tsx': { icon: '⚛️', color: '#3178c6' },
    'mjs': { icon: '📜', color: '#f7df1e' },
    
    // Web
    'html': { icon: '🌐', color: '#e34c26' },
    'css': { icon: '🎨', color: '#563d7c' },
    'scss': { icon: '🎨', color: '#c6538c' },
    'sass': { icon: '🎨', color: '#c6538c' },
    'less': { icon: '🎨', color: '#1d365d' },
    
    // Config
    'json': { icon: '⚙️', color: '#cbcb41' },
    'yaml': { icon: '⚙️', color: '#cb171e' },
    'yml': { icon: '⚙️', color: '#cb171e' },
    'toml': { icon: '⚙️', color: '#9c4221' },
    'xml': { icon: '📋', color: '#e37933' },
    'env': { icon: '🔐', color: '#faf047' },
    
    // Documentation
    'md': { icon: '📝', color: '#083fa1' },
    'mdx': { icon: '📝', color: '#fcb32c' },
    'txt': { icon: '📄', color: '#89e051' },
    'pdf': { icon: '📕', color: '#f40f02' },
    
    // Python
    'py': { icon: '🐍', color: '#3776ab' },
    'pyc': { icon: '🐍', color: '#3776ab' },
    'pyd': { icon: '🐍', color: '#3776ab' },
    'pyw': { icon: '🐍', color: '#3776ab' },
    
    // Java/Kotlin
    'java': { icon: '☕', color: '#b07219' },
    'class': { icon: '☕', color: '#b07219' },
    'jar': { icon: '☕', color: '#b07219' },
    'kt': { icon: '🟣', color: '#7f52ff' },
    
    // C/C++
    'c': { icon: '©️', color: '#555555' },
    'cpp': { icon: '©️', color: '#f34b7d' },
    'h': { icon: '©️', color: '#555555' },
    'hpp': { icon: '©️', color: '#f34b7d' },
    
    // Other languages
    'go': { icon: '🐹', color: '#00add8' },
    'rs': { icon: '🦀', color: '#dea584' },
    'php': { icon: '🐘', color: '#4f5d95' },
    'rb': { icon: '💎', color: '#701516' },
    'swift': { icon: '🦅', color: '#ffac45' },
    'dart': { icon: '🎯', color: '#00b4ab' },
    
    // Shell
    'sh': { icon: '🐚', color: '#89e051' },
    'bash': { icon: '🐚', color: '#89e051' },
    'zsh': { icon: '🐚', color: '#89e051' },
    'fish': { icon: '🐚', color: '#89e051' },
    
    // Database
    'sql': { icon: '🗄️', color: '#e38c00' },
    'db': { icon: '🗄️', color: '#e38c00' },
    'sqlite': { icon: '🗄️', color: '#003b57' },
    
    // Images
    'png': { icon: '🖼️', color: '#a074c4' },
    'jpg': { icon: '🖼️', color: '#a074c4' },
    'jpeg': { icon: '🖼️', color: '#a074c4' },
    'gif': { icon: '🖼️', color: '#a074c4' },
    'svg': { icon: '🎨', color: '#ffb13b' },
    'ico': { icon: '🖼️', color: '#a074c4' },
    'webp': { icon: '🖼️', color: '#a074c4' },
    
    // Archives
    'zip': { icon: '📦', color: '#ffe484' },
    'tar': { icon: '📦', color: '#ffe484' },
    'gz': { icon: '📦', color: '#ffe484' },
    'rar': { icon: '📦', color: '#ffe484' },
    '7z': { icon: '📦', color: '#ffe484' },
    
    // Special files
    'gitignore': { icon: '🚫', color: '#f54d27' },
    'dockerfile': { icon: '🐳', color: '#384d54' },
    'license': { icon: '📜', color: '#cbcb41' },
    'makefile': { icon: '🔨', color: '#427819' },
    'readme': { icon: '📖', color: '#083fa1' },
    'package': { icon: '📦', color: '#cb3837' },
    'tsconfig': { icon: '📘', color: '#3178c6' },
    'webpack': { icon: '📦', color: '#8dd6f9' },
    'vite': { icon: '⚡', color: '#646cff' },
  };

  const folderIcon = { icon: '📁', color: '#90a4ae' };
  const folderOpenIcon = { icon: '📂', color: '#90a4ae' };
  const defaultFileIcon = { icon: '📄', color: '#89e051' };

  function getFileIcon(name, isFolder = false, isOpen = false) {
    if (isFolder) {
      return isOpen ? folderOpenIcon : folderIcon;
    }

    const lowerName = name.toLowerCase();
    
    // Check special files first
    for (const [key, value] of Object.entries(fileIcons)) {
      if (lowerName.includes(key)) {
        return value;
      }
    }

    // Check extension
    const ext = name.split('.').pop()?.toLowerCase();
    return fileIcons[ext] || defaultFileIcon;
  }

  async function fetchRepoStructure() {
    try {
      const repoInfo = extractGitHubInfo(window.location.href);
      if (!repoInfo) return null;

      const { owner, repo, branch } = repoInfo;
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
      
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Failed to fetch repo structure');
      
      const data = await response.json();
      return buildTreeStructure(data.tree);
    } catch (error) {
      console.error('Error fetching repo structure:', error);
      return null;
    }
  }

  function extractGitHubInfo(url) {
    const githubPattern = /github\.com\/([^\/]+)\/([^\/]+)/;
    const match = url.match(githubPattern);
    if (!match) return null;

    const owner = match[1];
    const repo = match[2].split('?')[0].replace(/\.git$/, '');
    
    // Try to get current branch from URL or default to main
    let branch = 'main';
    const branchMatch = url.match(/\/tree\/([^\/]+)/);
    if (branchMatch) {
      branch = branchMatch[1];
    }

    return { owner, repo, branch };
  }

  function buildTreeStructure(items) {
    const root = { name: '/', type: 'tree', children: {}, path: '' };

    items.forEach(item => {
      const parts = item.path.split('/');
      let current = root;

      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          // It's a file
          if (item.type === 'blob') {
            current.children[part] = {
              name: part,
              type: 'blob',
              path: item.path,
              size: item.size
            };
          } else {
            // It's a folder at the end
            if (!current.children[part]) {
              current.children[part] = {
                name: part,
                type: 'tree',
                children: {},
                path: item.path
              };
            }
          }
        } else {
          // It's a folder in the path
          if (!current.children[part]) {
            current.children[part] = {
              name: part,
              type: 'tree',
              children: {},
              path: parts.slice(0, index + 1).join('/')
            };
          }
          current = current.children[part];
        }
      });
    });

    return root;
  }

  function createSidebar() {
    console.log('🌲 Creating sidebar element...');
    sidebar = document.createElement('div');
    sidebar.id = 'github-filetree-sidebar';
    sidebar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 280px;
      height: 100vh;
      background: #1e1e1e;
      color: #cccccc;
      z-index: 999999;
      box-shadow: 2px 0 8px rgba(0,0,0,0.3);
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      transition: transform 0.3s ease;
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 12px 16px;
      background: #252526;
      border-bottom: 1px solid #3e3e42;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
    `;

    const title = document.createElement('div');
    title.textContent = 'EXPLORER';
    title.style.cssText = `
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
      color: #cccccc;
    `;

    const controls = document.createElement('div');
    controls.style.cssText = `
      display: flex;
      gap: 8px;
    `;

    const refreshBtn = createIconButton('🔄', 'Refresh');
    refreshBtn.onclick = async () => {
      fileTreeData = await fetchRepoStructure();
      renderTree();
    };

    const collapseBtn = createIconButton('◀', 'Collapse');
    collapseBtn.onclick = toggleCollapse;

    controls.appendChild(refreshBtn);
    controls.appendChild(collapseBtn);
    header.appendChild(title);
    header.appendChild(controls);

    // Tree container
    const treeContainer = document.createElement('div');
    treeContainer.id = 'filetree-container';
    treeContainer.style.cssText = `
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 8px 0;
    `;

    // Custom scrollbar
    const style = document.createElement('style');
    style.textContent = `
      #filetree-container::-webkit-scrollbar {
        width: 10px;
      }
      #filetree-container::-webkit-scrollbar-track {
        background: #1e1e1e;
      }
      #filetree-container::-webkit-scrollbar-thumb {
        background: #424242;
        border-radius: 5px;
      }
      #filetree-container::-webkit-scrollbar-thumb:hover {
        background: #4e4e4e;
      }
      .filetree-item {
        padding: 4px 8px;
        cursor: pointer;
        user-select: none;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        white-space: nowrap;
        transition: background 0.1s;
      }
      .filetree-item:hover {
        background: #2a2d2e;
      }
      .filetree-item.active {
        background: #37373d;
      }
      .filetree-folder {
        font-weight: 500;
      }
      .filetree-icon {
        font-size: 16px;
        flex-shrink: 0;
      }
      .filetree-name {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .filetree-chevron {
        font-size: 10px;
        transition: transform 0.2s;
        flex-shrink: 0;
      }
      .filetree-chevron.open {
        transform: rotate(90deg);
      }
    `;
    document.head.appendChild(style);

    sidebar.appendChild(header);
    sidebar.appendChild(treeContainer);
    document.body.appendChild(sidebar);
    console.log('🌲 Sidebar added to DOM!');

    // Load and render tree
    loadTree();
  }

  function createIconButton(icon, title) {
    const btn = document.createElement('button');
    btn.textContent = icon;
    btn.title = title;
    btn.style.cssText = `
      background: transparent;
      border: none;
      color: #cccccc;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 14px;
      transition: background 0.2s;
    `;
    btn.onmouseenter = () => btn.style.background = '#3e3e42';
    btn.onmouseleave = () => btn.style.background = 'transparent';
    return btn;
  }

  async function loadTree() {
    const container = document.getElementById('filetree-container');
    container.innerHTML = '<div style="padding: 16px; text-align: center; color: #858585;">Loading...</div>';
    
    fileTreeData = await fetchRepoStructure();
    renderTree();
  }

  function renderTree() {
    const container = document.getElementById('filetree-container');
    
    if (!fileTreeData) {
      container.innerHTML = '<div style="padding: 16px; text-align: center; color: #858585;">Failed to load repository structure</div>';
      return;
    }

    container.innerHTML = '';
    const openFolders = new Set(['/']); // Root is open by default
    
    function renderNode(node, level = 0, parentPath = '') {
      const children = Object.values(node.children || {}).sort((a, b) => {
        // Folders first, then files
        if (a.type !== b.type) {
          return a.type === 'tree' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

      children.forEach(child => {
        const item = document.createElement('div');
        item.className = 'filetree-item';
        item.style.paddingLeft = `${level * 12 + 8}px`;

        const isFolder = child.type === 'tree';
        const isOpen = openFolders.has(child.path);
        const iconData = getFileIcon(child.name, isFolder, isOpen);

        if (isFolder) {
          item.classList.add('filetree-folder');
          
          const chevron = document.createElement('span');
          chevron.className = `filetree-chevron ${isOpen ? 'open' : ''}`;
          chevron.textContent = '▶';
          item.appendChild(chevron);
        } else {
          // Add spacing for files (no chevron)
          const spacer = document.createElement('span');
          spacer.style.width = '10px';
          item.appendChild(spacer);
        }

        const icon = document.createElement('span');
        icon.className = 'filetree-icon';
        icon.textContent = iconData.icon;
        item.appendChild(icon);

        const name = document.createElement('span');
        name.className = 'filetree-name';
        name.textContent = child.name;
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
            navigateToFile(child.path);
          }
        };

        container.appendChild(item);

        // Render children if folder is open
        if (isFolder && isOpen && child.children) {
          renderNode(child, level + 1, child.path);
        }
      });
    }

    renderNode(fileTreeData);
  }

  function navigateToFile(filePath) {
    const repoInfo = extractGitHubInfo(window.location.href);
    if (!repoInfo) return;

    const { owner, repo, branch } = repoInfo;
    const fileUrl = `https://github.com/${owner}/${repo}/blob/${branch}/${filePath}`;
    window.location.href = fileUrl;
  }

  function toggleCollapse() {
    isCollapsed = !isCollapsed;
    if (isCollapsed) {
      sidebar.style.transform = 'translateX(-280px)';
    } else {
      sidebar.style.transform = 'translateX(0)';
    }
  }

  // Initialize
  createSidebar();
  console.log('🌲 GitHub File Tree initialized successfully!');

  return {
    cleanup: () => {
      console.log('🌲 Cleaning up GitHub File Tree...');
      if (sidebar) {
        sidebar.remove();
      }
    }
  };
}
