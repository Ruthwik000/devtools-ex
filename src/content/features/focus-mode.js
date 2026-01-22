// Focus Mode - Remove YouTube distractions for focused learning
export function initFocusMode() {
  const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

  if (!window.location.hostname.includes('youtube.com')) {
    return { cleanup: () => { } };
  }

  console.log('Focus Mode initialized for YouTube');

  // Feature toggle states
  let extensionEnabled = true;
  let showComments = false;
  let showDescription = true;
  let blockShorts = true;
  let isMinimized = false;

  // Load UI state (minimized or expanded)
  const savedUIState = localStorage.getItem('focusModeUIState');
  if (savedUIState) {
    try {
      const uiState = JSON.parse(savedUIState);
      isMinimized = uiState.minimized || false;
    } catch (e) {
      console.error('Error parsing Focus Mode UI state:', e);
    }
  }

  // Load saved feature preferences
  browserAPI.storage.sync.get(['focusModeSettings'], (result) => {
    if (result.focusModeSettings) {
      extensionEnabled = result.focusModeSettings.extensionEnabled !== false;
      showComments = result.focusModeSettings.showComments || false;
      showDescription = result.focusModeSettings.showDescription !== false;
      blockShorts = result.focusModeSettings.blockShorts !== false;
      applyFocusMode();
      updatePanelUI();
    }
  });

  // CSS to hide distracting elements
  const style = document.createElement('style');
  style.id = 'focus-mode-style';
  style.textContent = `
    /* Focus Mode Control Panel */
    .focus-mode-panel {
      position: fixed;
      top: 80px;
      right: 20px;
      width: 340px;
      background: linear-gradient(135deg, #1F2937 0%, #111827 100%);
      border: 1px solid #374151;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #F3F4F6;
      overflow: hidden;
      resize: both;
      min-width: 300px;
      min-height: 280px;
    }

    .focus-mode-panel .resize-handle {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 20px;
      height: 20px;
      cursor: nwse-resize;
      background: linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.1) 50%);
      border-radius: 0 0 12px 0;
      z-index: 10;
    }

    .focus-mode-header {
      background: linear-gradient(135deg, #374151 0%, #1F2937 100%);
      padding: 14px 16px;
      cursor: move;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid #374151;
      user-select: none;
    }

    .focus-mode-logo {
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      overflow: hidden;
    }
    
    .focus-mode-logo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .focus-mode-title {
      font-size: 15px;
      font-weight: 600;
      flex: 1;
      color: #F9FAFB;
    }

    .focus-mode-minimize {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: transparent;
      border: none;
      color: #9CA3AF;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      transition: all 0.2s;
      font-weight: bold;
    }

    .focus-mode-minimize:hover {
      background: rgba(59, 130, 246, 0.1);
      color: #3B82F6;
    }

    .focus-mode-close {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: transparent;
      border: none;
      color: #9CA3AF;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      transition: all 0.2s;
    }

    .focus-mode-close:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #EF4444;
    }

    /* Minimized state */
    .focus-mode-panel.minimized {
      width: 240px;
      height: 60px;
      min-width: 240px;
      min-height: 60px;
      border-radius: 30px;
      cursor: default;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      resize: none;
      background: linear-gradient(135deg, #1F2937 0%, #111827 100%);
      border: 1px solid #374151;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .focus-mode-panel.minimized:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);
    }

    .focus-mode-panel.minimized .resize-handle {
      display: none;
    }

    .focus-mode-panel.minimized .focus-mode-header {
      padding: 12px 20px;
      justify-content: flex-start;
      align-items: center;
      border: none;
      cursor: move;
      background: transparent;
      gap: 12px;
    }

    .focus-mode-panel.minimized .focus-mode-logo {
      width: 36px;
      height: 36px;
      flex-shrink: 0;
      pointer-events: none;
      user-select: none;
    }

    .focus-mode-panel.minimized .focus-mode-title {
      display: block;
      font-size: 14px;
      color: #F9FAFB;
      pointer-events: none;
      user-select: none;
      line-height: 1;
      flex: 1;
    }

    .focus-mode-panel.minimized .focus-mode-minimize {
      display: none;
    }

    .focus-mode-panel.minimized .focus-mode-expand {
      display: flex;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: transparent;
      border: none;
      color: #9CA3AF;
      cursor: pointer;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      transition: all 0.2s;
      margin-left: auto;
      margin-right: 4px;
    }

    .focus-mode-panel.minimized .focus-mode-expand:hover {
      background: rgba(59, 130, 246, 0.1);
      color: #3B82F6;
    }

    .focus-mode-expand {
      display: none;
    }

    .focus-mode-panel.minimized .focus-mode-content,
    .focus-mode-panel.minimized .focus-mode-footer {
      display: none;
    }

    .focus-mode-panel.minimized .focus-mode-close {
      display: flex;
    }

    .focus-mode-content {
      padding: 16px;
    }

    .focus-mode-toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #374151;
    }

    .focus-mode-toggle-row:last-child {
      border-bottom: none;
    }

    .focus-mode-toggle-label {
      font-size: 14px;
      color: #E5E7EB;
      font-weight: 500;
    }

    .focus-mode-toggle-switch {
      position: relative;
      width: 48px;
      height: 26px;
      background: #4B5563;
      border-radius: 13px;
      cursor: pointer;
      transition: background 0.3s;
    }

    .focus-mode-toggle-switch.active {
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
    }

    .focus-mode-toggle-knob {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      transition: transform 0.3s;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .focus-mode-toggle-switch.active .focus-mode-toggle-knob {
      transform: translateX(22px);
    }

    .focus-mode-footer {
      padding: 12px 16px;
      border-top: 1px solid #374151;
      display: flex;
      gap: 8px;
      font-size: 11px;
      color: #9CA3AF;
      background: rgba(0, 0, 0, 0.2);
    }

    .focus-mode-footer a {
      color: #60A5FA;
      text-decoration: none;
      transition: color 0.2s;
    }

    .focus-mode-footer a:hover {
      color: #93C5FD;
      text-decoration: underline;
    }

    /* When extension is disabled */
    body.focus-mode-disabled .focus-mode-hide-element {
      display: block !important;
    }

    /* Hide homepage feed - show only search */
    body:not(.focus-mode-disabled) ytd-browse[page-subtype="home"] #contents,
    body:not(.focus-mode-disabled) ytd-browse[page-subtype="home"] ytd-two-column-browse-results-renderer {
      display: none !important;
    }

    /* Hide sidebar recommendations on video pages */
    body:not(.focus-mode-disabled) #related,
    body:not(.focus-mode-disabled) #secondary,
    body:not(.focus-mode-disabled) #secondary-inner,
    body:not(.focus-mode-disabled) ytd-watch-next-secondary-results-renderer {
      display: none !important;
    }

    /* Hide comments by default */
    body:not(.focus-mode-disabled):not(.focus-mode-show-comments) #comments,
    body:not(.focus-mode-disabled):not(.focus-mode-show-comments) ytd-comments {
      display: none !important;
    }

    /* When comments are enabled */
    body.focus-mode-show-comments #comments,
    body.focus-mode-show-comments ytd-comments {
      display: block !important;
    }

    /* When description is hidden */
    body:not(.focus-mode-disabled).focus-mode-hide-description #description,
    body:not(.focus-mode-disabled).focus-mode-hide-description ytd-video-secondary-info-renderer,
    body:not(.focus-mode-disabled).focus-mode-hide-description #description-inline-expander {
      display: none !important;
    }

    /* Block Shorts - Hide all shorts content */
    body.focus-mode-block-shorts ytd-reel-shelf-renderer,
    body.focus-mode-block-shorts ytd-rich-shelf-renderer[is-shorts],
    body.focus-mode-block-shorts [is-shorts],
    body.focus-mode-block-shorts ytd-guide-entry-renderer:has([title="Shorts"]),
    body.focus-mode-block-shorts ytd-mini-guide-entry-renderer:has([aria-label="Shorts"]),
    body.focus-mode-block-shorts a[href^="/shorts"],
    body.focus-mode-block-shorts ytd-rich-item-renderer:has(a[href^="/shorts"]),
    body.focus-mode-block-shorts ytd-video-renderer:has(a[href^="/shorts"]),
    body.focus-mode-block-shorts ytd-grid-video-renderer:has(a[href^="/shorts"]),
    body.focus-mode-block-shorts ytd-compact-video-renderer:has(a[href^="/shorts"]),
    body.focus-mode-block-shorts #shorts-container,
    body.focus-mode-block-shorts ytd-reel-video-renderer {
      display: none !important;
    }

    /* Hide Shorts tab in channel pages */
    body.focus-mode-block-shorts tp-yt-paper-tab:has([tab-title="Shorts"]),
    body.focus-mode-block-shorts yt-tab-shape:has([tab-title="Shorts"]) {
      display: none !important;
    }

    /* Block navigation to Shorts */
    body.focus-mode-block-shorts [href*="/shorts/"],
    body.focus-mode-block-shorts [href*="youtube.com/shorts"] {
      pointer-events: none !important;
      opacity: 0 !important;
      display: none !important;
    }
    
    /* When shorts blocking is disabled, ensure shorts are visible */
    body:not(.focus-mode-block-shorts) ytd-guide-entry-renderer:has([title="Shorts"]),
    body:not(.focus-mode-block-shorts) ytd-mini-guide-entry-renderer:has([aria-label="Shorts"]) {
      display: block !important;
    }

    /* Hide end screen recommendations */
    body:not(.focus-mode-disabled) .ytp-ce-element,
    body:not(.focus-mode-disabled) .ytp-endscreen-content,
    body:not(.focus-mode-disabled) .ytp-suggestion-set {
      display: none !important;
    }

    /* Expand video player to full width */
    body:not(.focus-mode-disabled) ytd-watch-flexy[flexy] #primary {
      max-width: 100% !important;
    }

    /* Clean search results - remove ads */
    body:not(.focus-mode-disabled) ytd-search-pyv-renderer,
    body:not(.focus-mode-disabled) ytd-ad-slot-renderer {
      display: none !important;
    }
  `;
  document.head.appendChild(style);

  // Panel reference (will be created by ensureUIExists)
  let panel = null;
  let header = null;

  // Function to create the focus mode control panel
  function createPanel() {
    const newPanel = document.createElement('div');
    newPanel.className = 'focus-mode-panel';
    newPanel.id = 'focus-mode-panel-unique-id'; // Unique ID to detect existence
    newPanel.innerHTML = `
      <div class="focus-mode-header">
        <div class="focus-mode-logo">
          <img src="${browserAPI.runtime.getURL('logos/youtube-focus-logo.png')}" alt="YouTube Focus" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none;">
        </div>
        <div class="focus-mode-title">YouTube Focus Mode</div>
        <button class="focus-mode-expand" title="Expand panel">□</button>
        <button class="focus-mode-minimize" title="Minimize panel">−</button>
        <button class="focus-mode-close" title="Close panel">×</button>
      </div>
      <div class="focus-mode-content">
        <div class="focus-mode-toggle-row">
          <div class="focus-mode-toggle-label">Extension enabled</div>
          <div class="focus-mode-toggle-switch ${extensionEnabled ? 'active' : ''}" data-toggle="extension">
            <div class="focus-mode-toggle-knob"></div>
          </div>
        </div>
        <div class="focus-mode-toggle-row">
          <div class="focus-mode-toggle-label">Comments</div>
          <div class="focus-mode-toggle-switch ${showComments ? 'active' : ''}" data-toggle="comments">
            <div class="focus-mode-toggle-knob"></div>
          </div>
        </div>
        <div class="focus-mode-toggle-row">
          <div class="focus-mode-toggle-label">Description</div>
          <div class="focus-mode-toggle-switch ${showDescription ? 'active' : ''}" data-toggle="description">
            <div class="focus-mode-toggle-knob"></div>
          </div>
        </div>
        <div class="focus-mode-toggle-row">
          <div class="focus-mode-toggle-label">Block Shorts</div>
          <div class="focus-mode-toggle-switch ${blockShorts ? 'active' : ''}" data-toggle="shorts">
            <div class="focus-mode-toggle-knob"></div>
          </div>
        </div>
      </div>
     
      <div class="resize-handle"></div>
    `;

    // Apply initial UI state (minimized or expanded only)
    if (isMinimized) {
      newPanel.classList.add('minimized');
    }

    return newPanel;
  }

  // Function to setup event listeners on the panel
  function setupPanelEvents(panelElement) {
    const headerElement = panelElement.querySelector('.focus-mode-header');

    // Make panel draggable from header
    headerElement.addEventListener('mousedown', dragStart);

    // Expand button (shown when minimized)
    const expandBtn = panelElement.querySelector('.focus-mode-expand');
    if (expandBtn) {
      expandBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        panelElement.classList.remove('minimized');
        isMinimized = false;
        panelElement.style.cursor = 'default';
        saveUIState();
      });
    }

    // Minimize button
    const minimizeBtn = panelElement.querySelector('.focus-mode-minimize');
    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        panelElement.classList.add('minimized');
        isMinimized = true;
        saveUIState();
      });
    }

    // Close button - disables Focus Mode entirely
    panelElement.querySelector('.focus-mode-close').addEventListener('click', () => {
      // Remove the panel
      panelElement.remove();

      // Clean up styles and classes
      const styleEl = document.getElementById('focus-mode-style');
      if (styleEl) styleEl.remove();

      document.body.classList.remove(
        'focus-mode-disabled',
        'focus-mode-show-comments',
        'focus-mode-hide-description',
        'focus-mode-block-shorts'
      );

      console.log('Focus Mode panel closed');

      // Stop the healing interval
      if (healingInterval) {
        clearInterval(healingInterval);
      }
      
      // Turn off the toggle in popup
      browserAPI.storage.sync.get(['toggles'], (result) => {
        const toggles = result.toggles || {};
        toggles.focusMode = false;
        browserAPI.storage.sync.set({ toggles });
      });
    });

    // Toggle switches
    panelElement.querySelectorAll('.focus-mode-toggle-switch').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const type = toggle.dataset.toggle;
        const isActive = toggle.classList.contains('active');

        if (type === 'extension') {
          extensionEnabled = !isActive;
          toggle.classList.toggle('active');
        } else if (type === 'comments') {
          showComments = !isActive;
          toggle.classList.toggle('active');
        } else if (type === 'description') {
          showDescription = !isActive;
          toggle.classList.toggle('active');
        } else if (type === 'shorts') {
          blockShorts = !isActive;
          toggle.classList.toggle('active');
        }

        applyFocusMode();
        saveSettings();
      });
    });

    return headerElement;
  }

  // Self-healing: Ensure UI exists and is in the DOM
  function ensureUIExists() {
    // Check if panel exists in DOM
    const existingPanel = document.getElementById('focus-mode-panel-unique-id');

    if (!existingPanel && document.body) {
      console.log('Focus Mode UI missing - recreating...');

      // Create new panel
      panel = createPanel();
      document.body.appendChild(panel);

      // Setup all event listeners
      header = setupPanelEvents(panel);

      // Update panel UI to match current state
      updatePanelUI();

      console.log('Focus Mode UI restored');
    } else if (existingPanel && !panel) {
      // Panel exists but we lost reference (page navigation)
      panel = existingPanel;
      header = panel.querySelector('.focus-mode-header');
    }
  }

  // Initial UI creation
  ensureUIExists();

  // Self-healing interval - check every 2 seconds if UI exists
  const healingInterval = setInterval(ensureUIExists, 2000);

  // Make panel draggable - these functions are used by setupPanelEvents
  let isDragging = false;
  let dragStarted = false;
  let currentX, currentY, initialX, initialY;

  function dragStart(e) {
    // Don't drag when clicking on buttons or images
    if (e.target.closest('.focus-mode-close') || 
        e.target.closest('.focus-mode-minimize') ||
        e.target.closest('.focus-mode-expand') ||
        e.target.tagName === 'IMG') return;
    
    // Only drag from header
    if (!panel || !e.target.closest('.focus-mode-header')) return;

    e.preventDefault();
    initialX = e.clientX - panel.offsetLeft;
    initialY = e.clientY - panel.offsetTop;
    isDragging = true;
    dragStarted = false;
    panel.style.cursor = 'grabbing';
  }

  function drag(e) {
    if (!isDragging || !panel) return;
    e.preventDefault();
    
    dragStarted = true;
    currentX = e.clientX - initialX;
    currentY = e.clientY - initialY;
    panel.style.left = currentX + 'px';
    panel.style.top = currentY + 'px';
    panel.style.right = 'auto';
  }

  function dragEnd() {
    if (!panel) return;
    
    isDragging = false;
    const isMinimizedNow = panel.classList.contains('minimized');
    panel.style.cursor = isMinimizedNow ? 'pointer' : 'default';
    
    // Reset dragStarted after a short delay
    setTimeout(() => {
      dragStarted = false;
    }, 100);
  }

  // Setup global drag listeners
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', dragEnd);

  // Save UI state to localStorage (only minimized state, not visibility)
  function saveUIState() {
    localStorage.setItem('focusModeUIState', JSON.stringify({
      minimized: isMinimized
    }));
  }

  // Update panel UI
  function updatePanelUI() {
    if (!panel) return;

    const extensionToggle = panel.querySelector('[data-toggle="extension"]');
    const commentsToggle = panel.querySelector('[data-toggle="comments"]');
    const descriptionToggle = panel.querySelector('[data-toggle="description"]');
    const shortsToggle = panel.querySelector('[data-toggle="shorts"]');

    if (extensionToggle) {
      extensionToggle.classList.toggle('active', extensionEnabled);
    }
    if (commentsToggle) {
      commentsToggle.classList.toggle('active', showComments);
    }
    if (descriptionToggle) {
      descriptionToggle.classList.toggle('active', showDescription);
    }
    if (shortsToggle) {
      shortsToggle.classList.toggle('active', blockShorts);
    }
  }

  // Save settings
  function saveSettings() {
    browserAPI.storage.sync.set({
      focusModeSettings: {
        extensionEnabled,
        showComments,
        showDescription,
        blockShorts
      }
    });
  }

  // Apply focus mode settings
  function applyFocusMode() {
    // Toggle extension
    if (!extensionEnabled) {
      document.body.classList.add('focus-mode-disabled');
    } else {
      document.body.classList.remove('focus-mode-disabled');
    }

    // Toggle comments
    if (showComments) {
      document.body.classList.add('focus-mode-show-comments');
    } else {
      document.body.classList.remove('focus-mode-show-comments');
    }

    // Toggle description
    if (!showDescription) {
      document.body.classList.add('focus-mode-hide-description');
    } else {
      document.body.classList.remove('focus-mode-hide-description');
    }

    // Toggle shorts blocking
    if (blockShorts) {
      document.body.classList.add('focus-mode-block-shorts');
    } else {
      document.body.classList.remove('focus-mode-block-shorts');
    }

    // Remove distracting elements
    if (extensionEnabled) {
      removeDistractingElements();
    }
  }

  // Remove distracting elements from DOM
  function removeDistractingElements() {
    if (!extensionEnabled) return;

    // Block Shorts if enabled - only redirect, don't remove elements
    if (blockShorts) {
      // Redirect if on shorts page
      if (window.location.pathname.includes('/shorts/')) {
        window.location.href = 'https://www.youtube.com/';
        return;
      }
    }

    // Remove end screen elements
    const endScreens = document.querySelectorAll('.ytp-ce-element, .ytp-endscreen-content');
    endScreens.forEach(el => el.remove());

    // Disable autoplay
    const video = document.querySelector('video');
    if (video) {
      const player = document.querySelector('.html5-video-player');
      if (player && player.setAutonavState) {
        player.setAutonavState(false);
      }
    }
  }

  // Run periodically to catch dynamically loaded content
  const cleanupInterval = setInterval(removeDistractingElements, 1000);

  // Observer for dynamic content
  const observer = new MutationObserver(() => {
    removeDistractingElements();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Listen for YouTube navigation
  const handleNavigateFinish = () => {
    applyFocusMode();
    removeDistractingElements();
  };

  document.addEventListener('yt-navigate-finish', handleNavigateFinish);

  // Run on load
  applyFocusMode();

  console.log('Focus Mode panel active');

  return {
    cleanup: () => {
      style.remove();
      if (panel) panel.remove();
      clearInterval(cleanupInterval);
      clearInterval(healingInterval); // Stop self-healing
      observer.disconnect();
      document.removeEventListener('mousemove', drag);
      document.removeEventListener('mouseup', dragEnd);
      if (header) header.removeEventListener('mousedown', dragStart);
      document.removeEventListener('yt-navigate-finish', handleNavigateFinish);
      document.body.classList.remove(
        'focus-mode-disabled',
        'focus-mode-show-comments',
        'focus-mode-hide-description',
        'focus-mode-block-shorts',
        'focus-mode-no-infinite-scroll'
      );
      console.log('Focus Mode disabled');
    }
  };
}
