// Content Script Bundle - Auto-generated
// Cross-browser API compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;


// ========== nuclear-mode-blocker.js ==========
// Nuclear Mode Blocker - Runs IMMEDIATELY on page load (BEFORE anything else)
// This is a standalone blocker that mimics the Site-Blocker-Chrome-Extension approach

// Use the browserAPI that's already declared in the bundle
console.log('🚀 Nuclear Mode Blocker: Script loaded');

// Normalize URL by removing 'www.' from the beginning
function normalizeURL(url) {
  return url.replace(/^www\./i, "");
}

// Check if the current website should be blocked
function shouldBlockWebsite(whitelistSet) {
  const currentHostname = normalizeURL(window.location.hostname);
  console.log('🔍 Nuclear Blocker: Checking hostname:', currentHostname);
  console.log('🔍 Nuclear Blocker: Whitelist:', whitelistSet);

  // Check if current site is in whitelist
  const isWhitelisted = whitelistSet.some(site => {
    const normalizedSite = normalizeURL(site);
    const matches = currentHostname === normalizedSite || currentHostname.includes(normalizedSite);
    console.log(`  🔍 Comparing ${currentHostname} with ${normalizedSite}: ${matches}`);
    return matches;
  });

  console.log('🔍 Nuclear Blocker: Is whitelisted:', isWhitelisted);
  return !isWhitelisted; // Block if NOT whitelisted
}

// Create the blocked page
function createBlockedPage(endTime, wl) {
  console.log('🔒 Nuclear Blocker: BLOCKING PAGE NOW!');

  // STOP page loading immediately
  try {
    window.stop();
  } catch (e) {
    console.log('Could not stop page loading:', e);
  }

  // Clear EVERYTHING from HTML
  const html = document.documentElement;
  if (html) {
    html.innerHTML = "";
  }

  const timeLeft = Math.ceil((endTime - Date.now()) / 1000 / 60);

  // Create HEAD with styles
  const head = document.createElement('head');
  const style = document.createElement('style');
  style.textContent = `
    @import url("https://fonts.googleapis.com/css?family=Aboreto");

    * {
      user-select: none !important;
      pointer-events: none !important;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html {
      background: linear-gradient(135deg, #1F2937 0%, #111827 100%) !important;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    body {
      width: 100%;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    #nuclear-block-container {
      display: block !important;
      color: #fff;
      text-align: center;
      max-width: 600px;
      padding: 40px;
      z-index: 999999999999;
      pointer-events: auto !important;
    }

    .block-icon {
      font-size: 96px;
      margin-bottom: 32px;
      animation: pulse 2s infinite;
    }

    .block-title {
      font-size: 48px;
      font-weight: 700;
      color: #F9FAFB;
      margin: 0 0 24px 0;
    }

    .block-subtitle {
      font-size: 20px;
      color: #9CA3AF;
      margin-bottom: 40px;
      line-height: 1.6;
    }

    .timer-box {
      background: rgba(239, 68, 68, 0.1);
      border: 2px solid #EF4444;
      padding: 32px;
      border-radius: 20px;
      margin-bottom: 32px;
    }

    .timer-label {
      font-size: 14px;
      color: #FCA5A5;
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-weight: 700;
    }

    .timer-value {
      font-size: 72px;
      font-weight: 700;
      color: #EF4444;
      font-family: 'Courier New', monospace;
    }

    .whitelist-box {
      background: rgba(255,255,255,0.05);
      border: 1px solid #374151;
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
    }

    .whitelist-title {
      font-size: 16px;
      color: #D1D5DB;
      margin-bottom: 16px;
      font-weight: 600;
    }

    .whitelist-item {
      font-size: 15px;
      color: #9CA3AF;
      line-height: 2;
      padding: 8px 0;
    }

    .warning-box {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid #EF4444;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
    }

    .warning-text {
      font-size: 16px;
      color: #FCA5A5;
      margin: 0;
      font-weight: 600;
    }

    .footer-text {
      font-size: 14px;
      color: #6B7280;
    }

    @keyframes pulse {
      0%, 100% { 
        transform: scale(1);
        opacity: 1;
      }
      50% { 
        transform: scale(1.1);
        opacity: 0.8;
      }
    }
  `;
  head.appendChild(style);

  // Create BODY with blocked content
  const body = document.createElement("body");
  body.innerHTML = `
    <div id="nuclear-block-container">
      <div class="block-icon">🔒</div>
      <h1 class="block-title">Nuclear Mode Active</h1>
      <p class="block-subtitle">
        This website is blocked. You can only access whitelisted sites during your focus session.
      </p>
      
      <div class="timer-box">
        <div class="timer-label">Time Remaining</div>
        <div id="block-timer-value" class="timer-value">${timeLeft} min</div>
      </div>

      <div class="whitelist-box">
        <div class="whitelist-title">✓ Whitelisted Sites</div>
        ${wl.map(site => `<div class="whitelist-item">• ${site}</div>`).join('')}
      </div>

      <div class="warning-box">
        <p class="warning-text">⚠️ Timer cannot be stopped. Stay focused!</p>
      </div>

      <p class="footer-text">
        Navigate to a whitelisted site to continue working.
      </p>
    </div>
  `;

  // Append head and body to html
  html.appendChild(head);
  html.appendChild(body);

  // Update timer every second
  setInterval(() => {
    const remaining = Math.ceil((endTime - Date.now()) / 1000 / 60);
    const timerEl = document.getElementById('block-timer-value');
    if (timerEl) {
      if (remaining > 0) {
        timerEl.textContent = `${remaining} min`;
      } else {
        timerEl.textContent = 'Done!';
        window.location.reload();
      }
    }
  }, 1000);

  // Prevent all escape attempts
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, true);

  document.addEventListener('keydown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, true);
}

// Check if the website should be blocked and take appropriate action
function check_if_restricted(nuclearMode) {
  console.log('🔍 Nuclear Blocker: check_if_restricted called');
  console.log('🔍 Nuclear Blocker: Nuclear Mode data:', nuclearMode);
  console.log('🔍 Nuclear Blocker: isActive:', nuclearMode?.isActive);
  console.log('🔍 Nuclear Blocker: timerEndTime:', nuclearMode?.timerEndTime);
  console.log('🔍 Nuclear Blocker: Current time:', Date.now());

  if (!nuclearMode || !nuclearMode.isActive || !nuclearMode.timerEndTime) {
    console.log('❌ Nuclear Blocker: Nuclear Mode not active or no timer');
    return;
  }

  // Check if timer hasn't expired
  if (Date.now() >= nuclearMode.timerEndTime) {
    console.log('❌ Nuclear Blocker: Timer expired - clearing storage');
    // Clear the nuclear mode from storage
    browserAPI.storage.local.set({
      nuclearMode: {
        whitelist: nuclearMode.whitelist || [],
        timerEndTime: null,
        isActive: false
      }
    });
    return;
  }

  const whitelistSet = nuclearMode.whitelist || [];

  if (shouldBlockWebsite(whitelistSet)) {
    console.log('🔒 Nuclear Blocker: SHOULD BLOCK - Creating blocked page');
    createBlockedPage(nuclearMode.timerEndTime, whitelistSet);
  } else {
    console.log('✅ Nuclear Blocker: Site is whitelisted - allowing access');
  }
}

// ============================================
// IMMEDIATE EXECUTION (EXACT same as reference site blocker)
// ============================================

// Retrieve Nuclear Mode data from storage and block if needed
browserAPI.storage.local.get("nuclearMode", function (data) {
  console.log('📦 Nuclear Blocker: Storage data retrieved:', JSON.stringify(data, null, 2));
  const nuclearMode = data.nuclearMode || null;

  console.log('📦 Nuclear Blocker: nuclearMode object:', nuclearMode);
  console.log('📦 Nuclear Blocker: isActive:', nuclearMode?.isActive);
  console.log('📦 Nuclear Blocker: timerEndTime:', nuclearMode?.timerEndTime);
  console.log('📦 Nuclear Blocker: Current time:', Date.now());

  if (nuclearMode && nuclearMode.isActive && nuclearMode.timerEndTime) {
    console.log('✅ Nuclear Blocker: Nuclear Mode is active with timer');

    // Check if timer hasn't expired
    if (Date.now() < nuclearMode.timerEndTime) {
      console.log('✅ Nuclear Blocker: Timer is still valid');

      // Call check function to block if needed
      check_if_restricted(nuclearMode);
    } else {
      console.log('❌ Nuclear Blocker: Timer expired');
    }
  } else {
    console.log('❌ Nuclear Blocker: Nuclear Mode NOT active');
    console.log('   - nuclearMode exists:', !!nuclearMode);
    console.log('   - isActive:', nuclearMode?.isActive);
    console.log('   - timerEndTime:', nuclearMode?.timerEndTime);
  }
});

console.log('🚀 Nuclear Mode Blocker: Script execution complete');


// ========== markdown-renderer.js ==========
// Simple Markdown Renderer for Chat Messages
// Converts markdown to HTML with proper formatting

function renderMarkdown(text) {
  if (!text) return '';
  
  let html = text;
  
  // Escape HTML first to prevent XSS
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Headers (must come before bold)
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');
  
  // Code blocks (triple backticks)
  html = html.replace(/```(\w+)?\n([\s\S]+?)```/g, '<pre><code>$2</code></pre>');
  
  // Inline code
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
  
  // Unordered lists
  html = html.replace(/^\* (.+)$/gim, '<li>$1</li>');
  html = html.replace(/^- (.+)$/gim, '<li>$1</li>');
  
  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gim, '<li>$1</li>');
  
  // Wrap consecutive list items in ul/ol
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
    return '<ul>' + match + '</ul>';
  });
  
  // Line breaks (double newline = paragraph)
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';
  
  // Single line breaks
  html = html.replace(/\n/g, '<br>');
  
  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>\s*<\/p>/g, '');
  
  return html;
}

// Add styles for markdown rendering
function addMarkdownStyles() {
  const styleId = 'markdown-chat-styles';
  
  // Check if styles already exist
  if (document.getElementById(styleId)) return;
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .markdown-content h1 {
      font-size: 18px;
      font-weight: 700;
      margin: 12px 0 8px 0;
      color: inherit;
    }
    
    .markdown-content h2 {
      font-size: 16px;
      font-weight: 700;
      margin: 10px 0 6px 0;
      color: inherit;
    }
    
    .markdown-content h3 {
      font-size: 14px;
      font-weight: 700;
      margin: 8px 0 4px 0;
      color: inherit;
    }
    
    .markdown-content p {
      margin: 8px 0;
      line-height: 1.6;
    }
    
    .markdown-content strong {
      font-weight: 700;
    }
    
    .markdown-content em {
      font-style: italic;
    }
    
    .markdown-content code {
      background: rgba(0, 0, 0, 0.1);
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
    }
    
    .markdown-content pre {
      background: rgba(0, 0, 0, 0.2);
      padding: 12px;
      border-radius: 6px;
      overflow-x: auto;
      margin: 8px 0;
    }
    
    .markdown-content pre code {
      background: none;
      padding: 0;
      font-size: 12px;
      line-height: 1.5;
    }
    
    .markdown-content ul {
      margin: 8px 0;
      padding-left: 24px;
      list-style-type: disc;
    }
    
    .markdown-content ol {
      margin: 8px 0;
      padding-left: 24px;
      list-style-type: decimal;
    }
    
    .markdown-content li {
      margin: 4px 0;
      line-height: 1.5;
    }
    
    .markdown-content a {
      color: #8b5cf6;
      text-decoration: underline;
    }
    
    .markdown-content a:hover {
      color: #7c3aed;
    }
    
    .markdown-content br {
      line-height: 1.6;
    }
    
    /* Dark theme adjustments for GitHub agent */
    #github-ai-chatbot .markdown-content code {
      background: rgba(255, 255, 255, 0.1);
    }
    
    #github-ai-chatbot .markdown-content pre {
      background: rgba(255, 255, 255, 0.05);
    }
    
    #github-ai-chatbot .markdown-content a {
      color: #58a6ff;
    }
    
    #github-ai-chatbot .markdown-content a:hover {
      color: #79c0ff;
    }
    
    /* Learning agent adjustments */
    #learning-agent-chatbot .message.assistant .markdown-content code {
      background: rgba(0, 0, 0, 0.2);
    }
    
    #learning-agent-chatbot .message.assistant .markdown-content pre {
      background: rgba(0, 0, 0, 0.3);
    }
  `;
  
  document.head.appendChild(style);
}


// ========== font-finder.js ==========
// Font Finder Feature
function initFontFinder() {
  const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
  let panel = null;
  let currentElement = null;

  // Dragging state
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let panelStartX = 0;
  let panelStartY = 0;

  // Resizing state
  let isResizing = false;
  let resizeStartX = 0;
  let resizeStartY = 0;
  let panelStartWidth = 0;
  let panelStartHeight = 0;

  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    
    const notif = document.createElement('div');
    notif.textContent = `Copied ${label}!`;
    notif.style.cssText = `
      position: fixed;
      left: 50%;
      top: 20px;
      transform: translateX(-50%);
      background: #10B981;
      color: white;
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 14px;
      z-index: 10000000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 2000);
  };

  const updatePanel = (element) => {
    if (!panel) return;
    
    const computedStyle = window.getComputedStyle(element);
    const fontFamily = computedStyle.fontFamily.replace(/['"]/g, '');
    const fontSize = computedStyle.fontSize;
    const fontWeight = computedStyle.fontWeight;
    const fontStyle = computedStyle.fontStyle;
    const color = computedStyle.color;
    const textContent = element.textContent.trim().substring(0, 50);
    
    // Parse RGB color
    const rgbMatch = color.match(/\d+/g);
    let hexColor = '#000000';
    let rgbColor = '(0, 0, 0)';
    if (rgbMatch) {
      hexColor = rgbToHex(+rgbMatch[0], +rgbMatch[1], +rgbMatch[2]);
      rgbColor = `(${rgbMatch[0]}, ${rgbMatch[1]}, ${rgbMatch[2]})`;
    }

    document.getElementById('font-sample-text').textContent = textContent || 'Sample Text';
    document.getElementById('font-sample-text').style.fontFamily = fontFamily;
    document.getElementById('font-family-value').textContent = fontFamily.split(',')[0];
    document.getElementById('font-size-value').textContent = fontSize;
    document.getElementById('font-weight-value').textContent = fontWeight;
    document.getElementById('font-style-value').textContent = fontStyle;
    document.getElementById('font-color-hex').textContent = hexColor;
    document.getElementById('font-color-rgb').textContent = rgbColor;
    document.getElementById('font-color-preview').style.background = hexColor;
  };

  const handleMouseMove = (e) => {
    const element = e.target;
    if (element === panel || panel?.contains(element)) return;
    
    currentElement = element;
    updatePanel(element);
    
    // Highlight element
    element.style.outline = '2px solid #3B82F6';
    element.style.outlineOffset = '2px';
    
    // Remove highlight from previous element
    document.querySelectorAll('[data-font-finder-highlight]').forEach(el => {
      if (el !== element) {
        el.style.outline = '';
        el.style.outlineOffset = '';
        el.removeAttribute('data-font-finder-highlight');
      }
    });
    
    element.setAttribute('data-font-finder-highlight', 'true');
  };

  const handleMouseLeave = (e) => {
    const element = e.target;
    if (element === panel || panel?.contains(element)) return;
    
    element.style.outline = '';
    element.style.outlineOffset = '';
    element.removeAttribute('data-font-finder-highlight');
  };

  // Create panel
  panel = document.createElement('div');
  panel.id = 'font-finder-panel';
  panel.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 320px;
    min-width: 280px;
    min-height: 400px;
    background: #1F2937;
    border-radius: 12px;
    border: 1px solid #374151;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    z-index: 9999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color: #E5E7EB;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  `;

  panel.innerHTML = `
    <div id="font-header" style="background: #111827; padding: 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #374151; cursor: move; user-select: none;">
      <div style="font-weight: 600; font-size: 16px;">Font Recognition</div>
      <button id="close-font-panel" style="background: none; border: none; color: #9CA3AF; cursor: pointer; font-size: 24px; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: all 0.2s;">×</button>
    </div>

    <div style="padding: 20px; flex: 1; overflow-y: auto;">
      <div style="text-align: center; margin-bottom: 20px; padding: 16px; background: #111827; border-radius: 8px;">
        <div style="font-size: 11px; color: #9CA3AF; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Hover over text to detect</div>
        <div id="font-sample-text" style="font-size: 24px; font-weight: 500; color: #E5E7EB; word-break: break-word;">Sample Text</div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #374151;">
          <span style="font-size: 13px; color: #9CA3AF;">Font-family</span>
          <span id="font-family-value" style="font-size: 13px; color: #E5E7EB; font-weight: 500;">-</span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #374151;">
          <span style="font-size: 13px; color: #9CA3AF;">Font-size</span>
          <span id="font-size-value" style="font-size: 13px; color: #E5E7EB; font-weight: 500;">-</span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #374151;">
          <span style="font-size: 13px; color: #9CA3AF;">Font Weight</span>
          <span id="font-weight-value" style="font-size: 13px; color: #E5E7EB; font-weight: 500;">-</span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #374151;">
          <span style="font-size: 13px; color: #9CA3AF;">Font Style</span>
          <span id="font-style-value" style="font-size: 13px; color: #E5E7EB; font-weight: 500;">-</span>
        </div>

        <div style="padding: 10px 0;">
          <div style="font-size: 13px; color: #9CA3AF; margin-bottom: 8px;">Color</div>
          <div style="display: flex; gap: 12px; align-items: center;">
            <div style="flex: 1;">
              <div style="font-size: 11px; color: #6B7280; margin-bottom: 4px;">HEX</div>
              <div id="font-color-hex" style="font-size: 13px; color: #E5E7EB; font-weight: 500; font-family: monospace;">#000000</div>
            </div>
            <div style="flex: 1;">
              <div style="font-size: 11px; color: #6B7280; margin-bottom: 4px;">RGB</div>
              <div id="font-color-rgb" style="font-size: 13px; color: #E5E7EB; font-weight: 500; font-family: monospace;">(0, 0, 0)</div>
            </div>
            <div id="font-color-preview" style="width: 40px; height: 40px; border-radius: 6px; border: 2px solid #374151; background: #000;"></div>
          </div>
        </div>
      </div>

      <button id="copy-all-font-btn" style="width: 100%; margin-top: 16px; background: rgba(59, 130, 246, 0.2); color: #60A5FA; border: 1px solid rgba(59, 130, 246, 0.3); padding: 12px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;">
        Copy all
      </button>
    </div>
  `;

  document.body.appendChild(panel);

  // Add resize handle
  const resizeHandle = document.createElement('div');
  resizeHandle.id = 'resize-handle-font';
  resizeHandle.style.cssText = `
    position: absolute;
    bottom: 0;
    right: 0;
    width: 20px;
    height: 20px;
    cursor: nwse-resize;
    background: linear-gradient(135deg, transparent 50%, #666 50%);
    border-radius: 0 0 12px 0;
    z-index: 10;
  `;
  panel.appendChild(resizeHandle);

  // Event listeners
  document.addEventListener('mouseover', handleMouseMove);
  document.addEventListener('mouseout', handleMouseLeave);

  // Make panel draggable
  const header = document.getElementById('font-header');
  
  header.addEventListener('mousedown', (e) => {
    if (e.target.id === 'close-font-panel' || e.target.closest('#close-font-panel')) {
      return;
    }
    
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    
    const rect = panel.getBoundingClientRect();
    panelStartX = rect.left;
    panelStartY = rect.top;
    
    panel.style.bottom = 'auto';
    panel.style.right = 'auto';
    panel.style.left = panelStartX + 'px';
    panel.style.top = panelStartY + 'px';
    
    header.style.cursor = 'grabbing';
    e.preventDefault();
  });

  // Make panel resizable
  resizeHandle.addEventListener('mousedown', (e) => {
    isResizing = true;
    resizeStartX = e.clientX;
    resizeStartY = e.clientY;
    
    panelStartWidth = panel.offsetWidth;
    panelStartHeight = panel.offsetHeight;
    
    e.preventDefault();
    e.stopPropagation();
  });

  // Mouse move handler
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStartX;
      const deltaY = e.clientY - dragStartY;
      
      let newX = panelStartX + deltaX;
      let newY = panelStartY + deltaY;
      
      const maxX = window.innerWidth - panel.offsetWidth;
      const maxY = window.innerHeight - panel.offsetHeight;
      
      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));
      
      panel.style.left = newX + 'px';
      panel.style.top = newY + 'px';
    }
    
    if (isResizing) {
      const deltaX = e.clientX - resizeStartX;
      const deltaY = e.clientY - resizeStartY;
      
      let newWidth = panelStartWidth + deltaX;
      let newHeight = panelStartHeight + deltaY;
      
      newWidth = Math.max(280, Math.min(newWidth, window.innerWidth * 0.9));
      newHeight = Math.max(400, Math.min(newHeight, window.innerHeight * 0.9));
      
      panel.style.width = newWidth + 'px';
      panel.style.height = newHeight + 'px';
    }
  });

  // Mouse up handler
  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      header.style.cursor = 'move';
    }
    if (isResizing) {
      isResizing = false;
    }
  });

  document.getElementById('close-font-panel').addEventListener('click', () => {
    panel.remove();
    document.removeEventListener('mouseover', handleMouseMove);
    document.removeEventListener('mouseout', handleMouseLeave);
    // Remove all highlights
    document.querySelectorAll('[data-font-finder-highlight]').forEach(el => {
      el.style.outline = '';
      el.style.outlineOffset = '';
      el.removeAttribute('data-font-finder-highlight');
    });
    // Turn off toggle
    browserAPI.storage.sync.set({ fontFinder: false });
  });

  document.getElementById('copy-all-font-btn').addEventListener('click', () => {
    if (!currentElement) return;
    
    const computedStyle = window.getComputedStyle(currentElement);
    const fontFamily = computedStyle.fontFamily.replace(/['"]/g, '');
    const fontSize = computedStyle.fontSize;
    const fontWeight = computedStyle.fontWeight;
    const fontStyle = computedStyle.fontStyle;
    const color = computedStyle.color;
    
    const rgbMatch = color.match(/\d+/g);
    let hexColor = '#000000';
    let rgbColor = '(0, 0, 0)';
    if (rgbMatch) {
      hexColor = rgbToHex(+rgbMatch[0], +rgbMatch[1], +rgbMatch[2]);
      rgbColor = `(${rgbMatch[0]}, ${rgbMatch[1]}, ${rgbMatch[2]})`;
    }
    
    const allInfo = `Font Family: ${fontFamily}
Font Size: ${fontSize}
Font Weight: ${fontWeight}
Font Style: ${fontStyle}
Color HEX: ${hexColor}
Color RGB: ${rgbColor}`;
    
    copyToClipboard(allInfo, 'all font info');
  });

  // Hover effect for close button
  const closeBtn = document.getElementById('close-font-panel');
  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.background = '#374151';
    closeBtn.style.color = '#fff';
  });
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.background = 'none';
    closeBtn.style.color = '#9CA3AF';
  });

  // Hover effect for copy button
  const copyBtn = document.getElementById('copy-all-font-btn');
  const originalBg = copyBtn.style.background;
  copyBtn.addEventListener('mouseenter', () => {
    copyBtn.style.background = 'rgba(59, 130, 246, 0.3)';
  });
  copyBtn.addEventListener('mouseleave', () => {
    copyBtn.style.background = originalBg;
  });

  return {
    cleanup: () => {
      document.removeEventListener('mouseover', handleMouseMove);
      document.removeEventListener('mouseout', handleMouseLeave);
      if (panel) panel.remove();
      // Remove all highlights
      document.querySelectorAll('[data-font-finder-highlight]').forEach(el => {
        el.style.outline = '';
        el.style.outlineOffset = '';
        el.removeAttribute('data-font-finder-highlight');
      });
    }
  };
}


// ========== color-finder.js ==========
// Color Finder - ColorFinder eyedropper and color picker
function initColorFinder() {
  const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
  
  let panel = null;
  let eyedropperActive = false;
  let magnifier = null;
  let canvas = null;
  let ctx = null;
  let currentColor = { r: 32, g: 165, b: 172, a: 1 };
  let colorHistory = [];
  let samplingSize = 1; // 1x1, 3x3, 5x5, 11x11, 25x25

  // Color conversion functions
  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  };

  const rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const rgbToHsv = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const d = max - min;
    let h, s = max === 0 ? 0 : d / max, v = max;
    if (max === min) {
      h = 0;
    } else {
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
  };

  const rgbToCmyk = (r, g, b) => {
    let c = 1 - (r / 255), m = 1 - (g / 255), y = 1 - (b / 255);
    let k = Math.min(c, m, y);
    if (k === 1) { c = m = y = 0; } 
    else { c = (c - k) / (1 - k); m = (m - k) / (1 - k); y = (y - k) / (1 - k); }
    return { c: Math.round(c * 100), m: Math.round(m * 100), y: Math.round(y * 100), k: Math.round(k * 100) };
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    showNotification(`Copied ${label}!`);
  };

  const showNotification = (message) => {
    const notif = document.createElement('div');
    notif.textContent = message;
    notif.style.cssText = `position: fixed; left: 50%; top: 20px; transform: translateX(-50%); background: #10B981; color: white; padding: 12px 24px; border-radius: 6px; font-size: 14px; z-index: 10000000; box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;`;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 2000);
  };

  // Create magnifying glass for eyedropper
  function createMagnifier() {
    magnifier = document.createElement('div');
    magnifier.style.cssText = `
      position: fixed; width: 140px; height: 140px; border: 3px solid #2D3748; border-radius: 50%; 
      pointer-events: none; z-index: 99999999; display: none; box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      background: white; overflow: hidden;
    `;
    
    canvas = document.createElement('canvas');
    canvas.width = 140;
    canvas.height = 140;
    canvas.style.cssText = 'width: 100%; height: 100%; image-rendering: pixelated;';
    ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    magnifier.appendChild(canvas);
    
    // Crosshair
    const crosshair = document.createElement('div');
    crosshair.style.cssText = `
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 20px; height: 20px; border: 2px solid #000; box-shadow: 0 0 0 1px #fff;
      pointer-events: none;
    `;
    magnifier.appendChild(crosshair);
    
    document.body.appendChild(magnifier);
  }

  // Get pixel color from screen
  async function getPixelColor(x, y) {
    try {
      // Capture screenshot of area around cursor
      const captureArea = {
        x: Math.max(0, x - 70),
        y: Math.max(0, y - 70),
        width: 140,
        height: 140
      };

      // Draw the area under cursor to canvas
      const element = document.elementFromPoint(x, y);
      if (!element) return null;

      // Get computed background color
      const computedStyle = window.getComputedStyle(element);
      let color = computedStyle.backgroundColor;
      
      // Try to get color from background image or actual element
      if (color === 'rgba(0, 0, 0, 0)' || color === 'transparent') {
        color = computedStyle.color;
      }

      // Parse RGB
      const rgbMatch = color.match(/\d+/g);
      if (rgbMatch && rgbMatch.length >= 3) {
        return {
          r: parseInt(rgbMatch[0]),
          g: parseInt(rgbMatch[1]),
          b: parseInt(rgbMatch[2])
        };
      }

      // Fallback: try to capture from canvas if it's an image
      if (element.tagName === 'IMG' || element.tagName === 'CANVAS') {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = element.width || element.offsetWidth;
        tempCanvas.height = element.height || element.offsetHeight;
        
        try {
          tempCtx.drawImage(element, 0, 0);
          const rect = element.getBoundingClientRect();
          const localX = x - rect.left;
          const localY = y - rect.top;
          const imageData = tempCtx.getImageData(localX, localY, 1, 1);
          return {
            r: imageData.data[0],
            g: imageData.data[1],
            b: imageData.data[2]
          };
        } catch (e) {
          console.log('Cannot read image data (CORS)');
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting pixel color:', error);
      return null;
    }
  }

  // Eyedropper mouse move handler
  function handleEyedropperMove(e) {
    if (!eyedropperActive) return;
    
    const x = e.clientX;
    const y = e.clientY;
    
    // Position magnifier
    magnifier.style.left = (x + 20) + 'px';
    magnifier.style.top = (y + 20) + 'px';
    magnifier.style.display = 'block';
    
    // Get color at cursor
    getPixelColor(x, y).then(color => {
      if (color) {
        // Draw magnified area (simplified - just show the color)
        ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
        ctx.fillRect(0, 0, 140, 140);
        
        // Update current color preview
        currentColor = color;
      }
    });
  }

  // Eyedropper click handler
  async function handleEyedropperClick(e) {
    if (!eyedropperActive) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const color = await getPixelColor(e.clientX, e.clientY);
    if (color) {
      updateColorDisplay(color.r, color.g, color.b);
      addToHistory(color.r, color.g, color.b);
      deactivateEyedropper();
      showNotification('Color picked!');
    }
  }

  function activateEyedropper() {
    eyedropperActive = true;
    document.body.style.cursor = 'crosshair';
    if (!magnifier) createMagnifier();
    magnifier.style.display = 'block';
    
    document.addEventListener('mousemove', handleEyedropperMove);
    document.addEventListener('click', handleEyedropperClick, true);
    
    // ESC to cancel
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        deactivateEyedropper();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  function deactivateEyedropper() {
    eyedropperActive = false;
    document.body.style.cursor = 'default';
    if (magnifier) magnifier.style.display = 'none';
    
    document.removeEventListener('mousemove', handleEyedropperMove);
    document.removeEventListener('click', handleEyedropperClick, true);
  }

  // Load color history from storage
  function loadColorHistory() {
    browserAPI.storage.local.get(['colorHistory'], (result) => {
      if (result.colorHistory) {
        colorHistory = result.colorHistory;
      }
    });
  }

  // Save color history to storage
  function saveColorHistory() {
    browserAPI.storage.local.set({ colorHistory: colorHistory });
  }

  // Add color to history
  function addToHistory(r, g, b) {
    const hex = rgbToHex(r, g, b);
    
    // Remove duplicate if exists
    colorHistory = colorHistory.filter(c => c.hex !== hex);
    
    // Add to beginning
    colorHistory.unshift({ r, g, b, hex, timestamp: Date.now() });
    
    // Keep only last 50 colors
    if (colorHistory.length > 50) {
      colorHistory = colorHistory.slice(0, 50);
    }
    
    saveColorHistory();
  }

  // Update color display
  function updateColorDisplay(r, g, b) {
    currentColor = { r, g, b, a: 1 };
    
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    const hsv = rgbToHsv(r, g, b);
    const cmyk = rgbToCmyk(r, g, b);

    // Update all format displays if panel exists
    if (panel) {
      const hexEl = panel.querySelector('#hex-value');
      const rgbEl = panel.querySelector('#rgb-value');
      const hslEl = panel.querySelector('#hsl-value');
      const hsvEl = panel.querySelector('#hsv-value');
      const cmykEl = panel.querySelector('#cmyk-value');
      
      if (hexEl) hexEl.textContent = hex;
      if (rgbEl) rgbEl.textContent = `rgb(${r}, ${g}, ${b})`;
      if (hslEl) hslEl.textContent = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
      if (hsvEl) hsvEl.textContent = `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`;
      if (cmykEl) cmykEl.textContent = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
      
      // Update color preview
      const preview = panel.querySelector('#color-preview');
      if (preview) {
        preview.style.background = `rgb(${r}, ${g}, ${b})`;
      }
    }
  }

  // Create main menu panel
  function createPanel() {
    panel = document.createElement('div');
    panel.id = 'colorfinder-panel';
    panel.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 420px; background: #FFFFFF; border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2); z-index: 9999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      overflow: hidden; display: flex; flex-direction: column;
    `;

    panel.innerHTML = `
      <div style="padding: 20px; border-bottom: 1px solid #E5E7EB;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h2 style="margin: 0; font-size: 18px; color: #1F2937; font-weight: 600;">ColorFinder</h2>
          <button id="close-panel" style="background: none; border: none; font-size: 24px; color: #6B7280; cursor: pointer; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 6px; transition: all 0.2s;">×</button>
        </div>
        
        <!-- Menu Items -->
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <button class="menu-item" data-action="pick-page" style="display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: white; border: 1px solid #E5E7EB; border-radius: 8px; cursor: pointer; transition: all 0.2s; width: 100%; text-align: left;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2">
              <path d="M7 17L17 7M17 7H7M17 7V17"/>
            </svg>
            <span style="font-size: 15px; color: #1F2937; font-weight: 500;">Pick Color From Page</span>
          </button>

          <button class="menu-item" data-action="color-picker" style="display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: white; border: 1px solid #E5E7EB; border-radius: 8px; cursor: pointer; transition: all 0.2s; width: 100%; text-align: left;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#FF0000"/>
              <circle cx="12" cy="12" r="7" fill="#00FF00"/>
              <circle cx="12" cy="12" r="4" fill="#0000FF"/>
            </svg>
            <span style="font-size: 15px; color: #1F2937; font-weight: 500;">Color Picker</span>
          </button>

          <button class="menu-item" data-action="history" style="display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: white; border: 1px solid #E5E7EB; border-radius: 8px; cursor: pointer; transition: all 0.2s; width: 100%; text-align: left;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span style="font-size: 15px; color: #1F2937; font-weight: 500;">Picked Color History</span>
          </button>
        </div>

        <div style="height: 1px; background: #E5E7EB; margin: 16px 0;"></div>

        <div style="display: flex; flex-direction: column; gap: 2px;">
          <button class="menu-item" data-action="analyzer" style="display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: white; border: 1px solid #E5E7EB; border-radius: 8px; cursor: pointer; transition: all 0.2s; width: 100%; text-align: left;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <span style="font-size: 15px; color: #1F2937; font-weight: 500;">Webpage Color Analyzer</span>
          </button>

          <button class="menu-item" data-action="palette" style="display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: white; border: 1px solid #E5E7EB; border-radius: 8px; cursor: pointer; transition: all 0.2s; width: 100%; text-align: left;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F97316" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>
            </svg>
            <span style="font-size: 15px; color: #1F2937; font-weight: 500;">Palette Browser</span>
          </button>

          <button class="menu-item" data-action="gradient" style="display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: white; border: 1px solid #E5E7EB; border-radius: 8px; cursor: pointer; transition: all 0.2s; width: 100%; text-align: left;">
            <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 4px;"></div>
            <span style="font-size: 15px; color: #1F2937; font-weight: 500;">CSS Gradient Generator</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    // Add event listeners
    panel.querySelector('#close-panel').addEventListener('click', () => {
      panel.remove();
      browserAPI.storage.sync.set({ colorFinder: false });
    });

    // Hover effects
    panel.querySelector('#close-panel').addEventListener('mouseenter', function() {
      this.style.background = '#FEE2E2';
      this.style.color = '#DC2626';
    });
    panel.querySelector('#close-panel').addEventListener('mouseleave', function() {
      this.style.background = 'none';
      this.style.color = '#6B7280';
    });

    // Menu item hover effects and actions
    panel.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('mouseenter', function() {
        this.style.background = '#F3F4F6';
        this.style.borderColor = '#3B82F6';
      });
      item.addEventListener('mouseleave', function() {
        this.style.background = 'white';
        this.style.borderColor = '#E5E7EB';
      });

      item.addEventListener('click', function() {
        const action = this.dataset.action;
        handleMenuAction(action);
      });
    });

    // Make draggable
    makeDraggable(panel);
  }

  // Handle menu actions
  function handleMenuAction(action) {
    switch (action) {
      case 'pick-page':
        panel.style.display = 'none';
        activateEyedropper();
        break;
      case 'color-picker':
        showColorPicker();
        break;
      case 'history':
        showColorHistory();
        break;
      case 'analyzer':
        showWebpageAnalyzer();
        break;
      case 'palette':
        showNotification('Palette Browser coming soon!');
        break;
      case 'gradient':
        showNotification('CSS Gradient Generator coming soon!');
        break;
    }
  }

  // Show color picker panel
  function showColorPicker() {
    panel.innerHTML = `
      <div style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <button id="back-btn" style="background: none; border: none; color: #3B82F6; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 4px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
          <h3 style="margin: 0; font-size: 16px; color: #1F2937;">Color Picker</h3>
          <button id="close-panel" style="background: none; border: none; font-size: 24px; color: #6B7280; cursor: pointer;">×</button>
        </div>

        <div id="color-preview" style="width: 100%; height: 80px; border-radius: 8px; margin-bottom: 16px; background: rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b}); border: 2px solid #E5E7EB;"></div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #F9FAFB; border-radius: 6px;">
            <span id="hex-value" style="font-family: monospace; font-size: 14px; color: #1F2937;">${rgbToHex(currentColor.r, currentColor.g, currentColor.b)}</span>
            <button class="copy-btn" data-format="hex" style="background: #3B82F6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Copy</button>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #F9FAFB; border-radius: 6px;">
            <span id="rgb-value" style="font-family: monospace; font-size: 14px; color: #1F2937;">rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})</span>
            <button class="copy-btn" data-format="rgb" style="background: #3B82F6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Copy</button>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #F9FAFB; border-radius: 6px;">
            <span id="hsl-value" style="font-family: monospace; font-size: 14px; color: #1F2937;">hsl(${rgbToHsl(currentColor.r, currentColor.g, currentColor.b).h}, ${rgbToHsl(currentColor.r, currentColor.g, currentColor.b).s}%, ${rgbToHsl(currentColor.r, currentColor.g, currentColor.b).l}%)</span>
            <button class="copy-btn" data-format="hsl" style="background: #3B82F6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Copy</button>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #F9FAFB; border-radius: 6px;">
            <span id="hsv-value" style="font-family: monospace; font-size: 14px; color: #1F2937;">hsv(${rgbToHsv(currentColor.r, currentColor.g, currentColor.b).h}, ${rgbToHsv(currentColor.r, currentColor.g, currentColor.b).s}%, ${rgbToHsv(currentColor.r, currentColor.g, currentColor.b).v}%)</span>
            <button class="copy-btn" data-format="hsv" style="background: #3B82F6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Copy</button>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #F9FAFB; border-radius: 6px;">
            <span id="cmyk-value" style="font-family: monospace; font-size: 14px; color: #1F2937;">cmyk(${rgbToCmyk(currentColor.r, currentColor.g, currentColor.b).c}%, ${rgbToCmyk(currentColor.r, currentColor.g, currentColor.b).m}%, ${rgbToCmyk(currentColor.r, currentColor.g, currentColor.b).y}%, ${rgbToCmyk(currentColor.r, currentColor.g, currentColor.b).k}%)</span>
            <button class="copy-btn" data-format="cmyk" style="background: #3B82F6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Copy</button>
          </div>
        </div>
      </div>
    `;

    attachCommonHandlers();
  }

  // Show color history
  function showColorHistory() {
    const historyHTML = colorHistory.length > 0 
      ? colorHistory.map(color => `
          <div class="history-item" data-rgb="${color.r},${color.g},${color.b}" style="display: flex; align-items: center; gap: 12px; padding: 12px; background: #F9FAFB; border-radius: 6px; cursor: pointer; transition: all 0.2s;">
            <div style="width: 40px; height: 40px; border-radius: 6px; background: rgb(${color.r}, ${color.g}, ${color.b}); border: 2px solid #E5E7EB; flex-shrink: 0;"></div>
            <div style="flex: 1;">
              <div style="font-family: monospace; font-size: 14px; color: #1F2937; font-weight: 600;">${color.hex}</div>
              <div style="font-size: 12px; color: #6B7280;">rgb(${color.r}, ${color.g}, ${color.b})</div>
            </div>
            <button class="copy-history-btn" data-hex="${color.hex}" style="background: #3B82F6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Copy</button>
          </div>
        `).join('')
      : '<div style="text-align: center; padding: 40px; color: #9CA3AF;">No colors picked yet. Use "Pick Color From Page" to start!</div>';

    panel.innerHTML = `
      <div style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <button id="back-btn" style="background: none; border: none; color: #3B82F6; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 4px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
          <h3 style="margin: 0; font-size: 16px; color: #1F2937;">Color History</h3>
          <button id="close-panel" style="background: none; border: none; font-size: 24px; color: #6B7280; cursor: pointer;">×</button>
        </div>

        <div style="max-height: 400px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
          ${historyHTML}
        </div>

        ${colorHistory.length > 0 ? '<button id="clear-history" style="width: 100%; margin-top: 16px; padding: 10px; background: #EF4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">Clear History</button>' : ''}
      </div>
    `;

    attachCommonHandlers();

    // History item click
    panel.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('mouseenter', function() {
        this.style.background = '#E5E7EB';
      });
      item.addEventListener('mouseleave', function() {
        this.style.background = '#F9FAFB';
      });
      item.addEventListener('click', function(e) {
        if (e.target.classList.contains('copy-history-btn')) return;
        const rgb = this.dataset.rgb.split(',').map(Number);
        currentColor = { r: rgb[0], g: rgb[1], b: rgb[2], a: 1 };
        showColorPicker();
      });
    });

    // Copy buttons
    panel.querySelectorAll('.copy-history-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        copyToClipboard(this.dataset.hex, 'HEX');
      });
    });

    // Clear history
    const clearBtn = panel.querySelector('#clear-history');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        colorHistory = [];
        saveColorHistory();
        showColorHistory();
        showNotification('History cleared!');
      });
    }
  }

  // Show webpage color analyzer
  function showWebpageAnalyzer() {
    showNotification('Analyzing webpage colors...');
    
    const colors = new Map();
    const elements = document.querySelectorAll('*');
    
    elements.forEach(el => {
      if (el.id === 'colorfinder-panel') return;
      
      const style = window.getComputedStyle(el);
      const bgColor = style.backgroundColor;
      const textColor = style.color;
      
      [bgColor, textColor].forEach(color => {
        if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
          const match = color.match(/\d+/g);
          if (match && match.length >= 3) {
            const hex = rgbToHex(parseInt(match[0]), parseInt(match[1]), parseInt(match[2]));
            colors.set(hex, { r: parseInt(match[0]), g: parseInt(match[1]), b: parseInt(match[2]) });
          }
        }
      });
    });

    const colorArray = Array.from(colors.values()).slice(0, 20);

    panel.innerHTML = `
      <div style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <button id="back-btn" style="background: none; border: none; color: #3B82F6; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 4px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
          <h3 style="margin: 0; font-size: 16px; color: #1F2937;">Webpage Colors</h3>
          <button id="close-panel" style="background: none; border: none; font-size: 24px; color: #6B7280; cursor: pointer;">×</button>
        </div>

        <div style="margin-bottom: 12px; color: #6B7280; font-size: 14px;">Found ${colorArray.length} unique colors</div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; max-height: 400px; overflow-y: auto;">
          ${colorArray.map(color => `
            <div class="analyzer-color" data-rgb="${color.r},${color.g},${color.b}" style="cursor: pointer; transition: all 0.2s;">
              <div style="width: 100%; aspect-ratio: 1; background: rgb(${color.r}, ${color.g}, ${color.b}); border-radius: 8px; border: 2px solid #E5E7EB; margin-bottom: 6px;"></div>
              <div style="font-family: monospace; font-size: 11px; color: #1F2937; text-align: center;">${rgbToHex(color.r, color.g, color.b)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    attachCommonHandlers();

    // Color click handlers
    panel.querySelectorAll('.analyzer-color').forEach(item => {
      item.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
      });
      item.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
      });
      item.addEventListener('click', function() {
        const rgb = this.dataset.rgb.split(',').map(Number);
        currentColor = { r: rgb[0], g: rgb[1], b: rgb[2], a: 1 };
        addToHistory(rgb[0], rgb[1], rgb[2]);
        showColorPicker();
      });
    });
  }

  // Attach common handlers (back, close, copy buttons)
  function attachCommonHandlers() {
    const backBtn = panel.querySelector('#back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        panel.remove();
        createPanel();
      });
    }

    const closeBtn = panel.querySelector('#close-panel');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        panel.remove();
        browserAPI.storage.sync.set({ colorFinder: false });
      });
    }

    panel.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const format = this.dataset.format;
        const value = panel.querySelector(`#${format}-value`).textContent;
        copyToClipboard(value, format.toUpperCase());
      });
    });
  }

  // Make panel draggable
  function makeDraggable(element) {
    let isDragging = false;
    let startX, startY, startLeft, startTop;

    element.addEventListener('mousedown', function(e) {
      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
      
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = element.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      element.style.transform = 'none';
      element.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      element.style.left = (startLeft + dx) + 'px';
      element.style.top = (startTop + dy) + 'px';
    });

    document.addEventListener('mouseup', function() {
      if (isDragging) {
        isDragging = false;
        element.style.cursor = 'default';
      }
    });
  }

  // Initialize
  loadColorHistory();
  createPanel();

  return {
    cleanup: () => {
      if (panel) panel.remove();
      if (magnifier) magnifier.remove();
      deactivateEyedropper();
    }
  };
}


// ========== edit-cookie.js ==========
// Cookie Editor Feature - Comprehensive with Dark UI
function initEditCookie() {
  const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
  
  let allCookies = [];
  let filteredCookies = [];
  let selectedCookie = null;
  let editMode = false;

  // Dragging state
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let panelStartX = 0;
  let panelStartY = 0;

  // Resizing state
  let isResizing = false;
  let resizeStartX = 0;
  let resizeStartY = 0;
  let panelStartWidth = 0;
  let panelStartHeight = 0;

  const panel = document.createElement('div');
  panel.id = 'cookie-editor-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 700px;
    height: 600px;
    min-width: 500px;
    min-height: 400px;
    max-width: 95vw;
    max-height: 95vh;
    background: #1F2937;
    border-radius: 12px;
    border: 1px solid #374151;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    z-index: 999999;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color: #E5E7EB;
    resize: both;
    overflow: hidden;
  `;

  panel.innerHTML = `
    <div id="cookie-header" style="background: #111827; padding: 16px; border-radius: 12px 12px 0 0; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #374151; cursor: move; user-select: none;">
      <div style="font-weight: 600; font-size: 16px; color: #E5E7EB;">Cookie Editor - ${window.location.hostname}</div>
      <button id="close-cookie-panel" style="background: none; border: none; color: #9CA3AF; cursor: pointer; font-size: 24px; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: all 0.2s;">×</button>
    </div>

    <div style="padding: 16px; border-bottom: 1px solid #374151; background: #111827;">
      <div style="display: flex; gap: 8px; margin-bottom: 12px;">
        <input type="text" id="cookie-search" placeholder="Search cookies..." style="flex: 1; background: #1F2937; border: 1px solid #374151; color: #E5E7EB; padding: 10px 12px; border-radius: 6px; font-size: 13px; outline: none;">
        <button id="add-cookie-btn" style="background: rgba(59, 130, 246, 0.2); color: #60A5FA; border: 1px solid rgba(59, 130, 246, 0.3); padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s; white-space: nowrap; min-width: 80px;">+ Add</button>
        <button id="import-cookies-btn" style="background: rgba(59, 130, 246, 0.2); color: #60A5FA; border: 1px solid rgba(59, 130, 246, 0.3); padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s; white-space: nowrap; min-width: 80px;">Import</button>
        <button id="export-cookies-btn" style="background: rgba(59, 130, 246, 0.2); color: #60A5FA; border: 1px solid rgba(59, 130, 246, 0.3); padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s; white-space: nowrap; min-width: 80px;">Export</button>
        <button id="delete-all-btn" style="background: rgba(239, 68, 68, 0.2); color: #F87171; border: 1px solid rgba(239, 68, 68, 0.3); padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s; white-space: nowrap; min-width: 100px;">Delete All</button>
      </div>
      <div style="font-size: 12px; color: #9CA3AF;">
        <span id="cookie-count">0 cookies</span>
      </div>
    </div>

    <div style="display: flex; flex: 1; overflow: hidden; position: relative;">
      <div id="cookie-list-container" style="flex: 1; overflow-y: auto; background: #1F2937;">
        <div id="cookie-list">
          <div style="padding: 20px; text-align: center; color: #6B7280;">Loading cookies...</div>
        </div>
      </div>

      <div id="cookie-details" style="width: 350px; overflow-y: auto; padding: 16px; background: #111827; border-left: 1px solid #374151; display: none;">
        <div style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #374151;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px; color: #E5E7EB;">Cookie Details</div>
          <div style="font-size: 11px; color: #9CA3AF;">View and edit cookie properties</div>
        </div>

        <div id="cookie-form">
          <div style="margin-bottom: 12px;">
            <label style="display: block; font-size: 11px; color: #9CA3AF; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Name</label>
            <input type="text" id="edit-name" style="width: 100%; background: #1F2937; border: 1px solid #374151; color: #E5E7EB; padding: 8px; border-radius: 4px; font-size: 13px; box-sizing: border-box;">
          </div>

          <div style="margin-bottom: 12px;">
            <label style="display: block; font-size: 11px; color: #9CA3AF; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Value</label>
            <textarea id="edit-value" rows="3" style="width: 100%; background: #1F2937; border: 1px solid #374151; color: #E5E7EB; padding: 8px; border-radius: 4px; font-size: 13px; resize: vertical; box-sizing: border-box; font-family: monospace;"></textarea>
          </div>

          <div style="margin-bottom: 12px;">
            <label style="display: block; font-size: 11px; color: #9CA3AF; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Domain</label>
            <input type="text" id="edit-domain" style="width: 100%; background: #1F2937; border: 1px solid #374151; color: #E5E7EB; padding: 8px; border-radius: 4px; font-size: 13px; box-sizing: border-box;">
          </div>

          <div style="margin-bottom: 12px;">
            <label style="display: block; font-size: 11px; color: #9CA3AF; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Path</label>
            <input type="text" id="edit-path" value="/" style="width: 100%; background: #1F2937; border: 1px solid #374151; color: #E5E7EB; padding: 8px; border-radius: 4px; font-size: 13px; box-sizing: border-box;">
          </div>

          <div style="margin-bottom: 12px;">
            <label style="display: block; font-size: 11px; color: #9CA3AF; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Expires</label>
            <input type="datetime-local" id="edit-expires" style="width: 100%; background: #1F2937; border: 1px solid #374151; color: #E5E7EB; padding: 8px; border-radius: 4px; font-size: 13px; box-sizing: border-box;">
            <div style="margin-top: 4px;">
              <label style="font-size: 11px; color: #9CA3AF; cursor: pointer;">
                <input type="checkbox" id="edit-session" style="margin-right: 4px;"> Session cookie
              </label>
            </div>
          </div>

          <div style="margin-bottom: 12px; display: flex; gap: 12px;">
            <label style="font-size: 12px; color: #E5E7EB; cursor: pointer; display: flex; align-items: center;">
              <input type="checkbox" id="edit-secure" style="margin-right: 6px;"> Secure
            </label>
            <label style="font-size: 12px; color: #E5E7EB; cursor: pointer; display: flex; align-items: center;">
              <input type="checkbox" id="edit-httponly" style="margin-right: 6px;"> HttpOnly
            </label>
          </div>

          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 11px; color: #9CA3AF; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">SameSite</label>
            <select id="edit-samesite" style="width: 100%; background: #1F2937; border: 1px solid #374151; color: #E5E7EB; padding: 8px; border-radius: 4px; font-size: 13px; box-sizing: border-box;">
              <option value="no_restriction">No restriction</option>
              <option value="lax">Lax</option>
              <option value="strict">Strict</option>
            </select>
          </div>

          <div style="display: flex; gap: 8px;">
            <button id="save-cookie-btn" style="flex: 1; background: rgba(59, 130, 246, 0.2); color: #60A5FA; border: 1px solid rgba(59, 130, 246, 0.3); padding: 10px; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 13px; transition: all 0.2s;">
              Save
            </button>
            <button id="delete-cookie-btn" style="flex: 1; background: rgba(239, 68, 68, 0.2); color: #F87171; border: 1px solid rgba(239, 68, 68, 0.3); padding: 10px; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 13px; transition: all 0.2s;">
              Delete
            </button>
            <button id="cancel-edit-btn" style="flex: 1; background: rgba(107, 114, 128, 0.2); color: #9CA3AF; border: 1px solid rgba(107, 114, 128, 0.3); padding: 10px; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 13px; transition: all 0.2s;">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(panel);

  // Add resize handle at the end
  const resizeHandle = document.createElement('div');
  resizeHandle.id = 'resize-handle-corner';
  resizeHandle.style.cssText = `
    position: absolute;
    bottom: 0;
    right: 0;
    width: 20px;
    height: 20px;
    cursor: nwse-resize;
    background: linear-gradient(135deg, transparent 50%, #666 50%);
    border-radius: 0 0 12px 0;
    z-index: 10;
  `;
  panel.appendChild(resizeHandle);

  // Make panel draggable
  const header = document.getElementById('cookie-header');
  
  header.addEventListener('mousedown', (e) => {
    if (e.target.id === 'close-cookie-panel' || e.target.closest('#close-cookie-panel')) {
      return;
    }
    
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    
    const rect = panel.getBoundingClientRect();
    panelStartX = rect.left;
    panelStartY = rect.top;
    
    panel.style.transform = 'none';
    panel.style.left = panelStartX + 'px';
    panel.style.top = panelStartY + 'px';
    
    header.style.cursor = 'grabbing';
    e.preventDefault();
  });

  // Make panel resizable
  resizeHandle.addEventListener('mousedown', (e) => {
    isResizing = true;
    resizeStartX = e.clientX;
    resizeStartY = e.clientY;
    
    panelStartWidth = panel.offsetWidth;
    panelStartHeight = panel.offsetHeight;
    
    e.preventDefault();
    e.stopPropagation();
  });

  // Mouse move handler
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStartX;
      const deltaY = e.clientY - dragStartY;
      
      let newX = panelStartX + deltaX;
      let newY = panelStartY + deltaY;
      
      // Keep panel within viewport
      const maxX = window.innerWidth - panel.offsetWidth;
      const maxY = window.innerHeight - panel.offsetHeight;
      
      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));
      
      panel.style.left = newX + 'px';
      panel.style.top = newY + 'px';
    }
    
    if (isResizing) {
      const deltaX = e.clientX - resizeStartX;
      const deltaY = e.clientY - resizeStartY;
      
      let newWidth = panelStartWidth + deltaX;
      let newHeight = panelStartHeight + deltaY;
      
      // Apply min/max constraints
      newWidth = Math.max(500, Math.min(newWidth, window.innerWidth * 0.95));
      newHeight = Math.max(400, Math.min(newHeight, window.innerHeight * 0.95));
      
      panel.style.width = newWidth + 'px';
      panel.style.height = newHeight + 'px';
    }
  });

  // Mouse up handler
  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      header.style.cursor = 'move';
    }
    if (isResizing) {
      isResizing = false;
    }
  });

  // Load cookies
  function loadCookies() {
    console.log('Loading cookies for:', window.location.href);
    browserAPI.runtime.sendMessage({ type: 'GET_COOKIES', url: window.location.href }, (response) => {
      console.log('Cookies response:', response);
      if (response && response.cookies) {
        allCookies = response.cookies;
        filteredCookies = allCookies;
        console.log('Loaded cookies:', allCookies.length);
        renderCookieList();
        updateStats();
      } else {
        console.error('No cookies in response');
        allCookies = [];
        filteredCookies = [];
        renderCookieList();
        updateStats();
      }
    });
  }

  function renderCookieList() {
    const list = document.getElementById('cookie-list');
    
    if (filteredCookies.length === 0) {
      list.innerHTML = '<div style="padding: 40px 20px; text-align: center; color: #6B7280;">No cookies found</div>';
      return;
    }

    list.innerHTML = filteredCookies.map(cookie => `
      <div class="cookie-item" data-cookie='${JSON.stringify(cookie).replace(/'/g, "&#39;")}' style="padding: 12px 16px; border-bottom: 1px solid #374151; cursor: pointer; transition: all 0.2s; ${selectedCookie === cookie ? 'background: #111827; border-left: 2px solid #3B82F6;' : ''}">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 500; font-size: 13px; color: #E5E7EB; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${cookie.name}</div>
            <div style="font-size: 11px; color: #9CA3AF; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${cookie.value.substring(0, 50)}${cookie.value.length > 50 ? '...' : ''}</div>
            <div style="font-size: 10px; color: #6B7280; margin-top: 4px;">
              ${cookie.domain} • ${cookie.path || '/'}
            </div>
          </div>
        </div>
      </div>
    `).join('');

    // Add click handlers
    document.querySelectorAll('.cookie-item').forEach(item => {
      item.addEventListener('click', () => {
        const cookie = JSON.parse(item.dataset.cookie);
        selectCookie(cookie);
      });
      
      item.addEventListener('mouseenter', () => {
        if (!item.dataset.cookie || JSON.parse(item.dataset.cookie) !== selectedCookie) {
          item.style.background = '#111827';
        }
      });
      
      item.addEventListener('mouseleave', () => {
        if (!item.dataset.cookie || JSON.parse(item.dataset.cookie) !== selectedCookie) {
          item.style.background = 'transparent';
        }
      });
    });
  }

  function selectCookie(cookie) {
    selectedCookie = cookie;
    editMode = false;
    document.getElementById('cookie-details').style.display = 'block';
    
    // Populate form
    document.getElementById('edit-name').value = cookie.name;
    document.getElementById('edit-value').value = cookie.value;
    document.getElementById('edit-domain').value = cookie.domain;
    document.getElementById('edit-path').value = cookie.path || '/';
    document.getElementById('edit-secure').checked = cookie.secure || false;
    document.getElementById('edit-httponly').checked = cookie.httpOnly || false;
    document.getElementById('edit-session').checked = !cookie.expirationDate;
    
    if (cookie.expirationDate) {
      const date = new Date(cookie.expirationDate * 1000);
      document.getElementById('edit-expires').value = date.toISOString().slice(0, 16);
    } else {
      document.getElementById('edit-expires').value = '';
    }
    
    if (cookie.sameSite) {
      document.getElementById('edit-samesite').value = cookie.sameSite;
    }

    // Show delete button for existing cookies
    document.getElementById('delete-cookie-btn').style.display = 'block';

    renderCookieList();
  }

  function deleteCookie(name, domain) {
    console.log('Deleting cookie:', name, domain);
    browserAPI.runtime.sendMessage({ 
      type: 'REMOVE_COOKIE', 
      url: window.location.href, 
      name: name,
      domain: domain
    }, (response) => {
      if (response && response.success) {
        console.log('Cookie deleted successfully');
        loadCookies();
        if (selectedCookie && selectedCookie.name === name) {
          document.getElementById('cookie-details').style.display = 'none';
          selectedCookie = null;
        }
      } else {
        console.error('Failed to delete cookie:', response?.error);
      }
    });
  }

  function updateStats() {
    document.getElementById('cookie-count').textContent = `${allCookies.length} cookie${allCookies.length !== 1 ? 's' : ''}`;
  }

  // Export cookies
  function exportCookies() {
    const cookiesJSON = JSON.stringify(allCookies, null, 2);
    const blob = new Blob([cookiesJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cookies_${window.location.hostname}_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Import cookies
  function importCookies() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const cookies = JSON.parse(event.target.result);
            if (Array.isArray(cookies)) {
              cookies.forEach(cookie => {
                browserAPI.runtime.sendMessage({ 
                  type: 'SET_COOKIE', 
                  url: window.location.href,
                  cookie: cookie
                });
              });
              setTimeout(() => loadCookies(), 500);
            }
          } catch (error) {
            alert('Invalid cookie file format');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  // Search functionality
  document.getElementById('cookie-search').addEventListener('input', (e) => {
    const search = e.target.value.toLowerCase();
    filteredCookies = allCookies.filter(cookie => 
      cookie.name.toLowerCase().includes(search) || 
      cookie.value.toLowerCase().includes(search)
    );
    renderCookieList();
  });

  // Add cookie
  document.getElementById('add-cookie-btn').addEventListener('click', () => {
    selectedCookie = null;
    editMode = true;
    document.getElementById('cookie-details').style.display = 'block';
    
    // Clear form
    document.getElementById('edit-name').value = '';
    document.getElementById('edit-value').value = '';
    document.getElementById('edit-domain').value = window.location.hostname;
    document.getElementById('edit-path').value = '/';
    document.getElementById('edit-secure').checked = false;
    document.getElementById('edit-httponly').checked = false;
    document.getElementById('edit-session').checked = true;
    document.getElementById('edit-expires').value = '';
    
    // Hide delete button for new cookies
    document.getElementById('delete-cookie-btn').style.display = 'none';
  });

  // Import cookies
  document.getElementById('import-cookies-btn').addEventListener('click', () => {
    importCookies();
  });

  // Export cookies
  document.getElementById('export-cookies-btn').addEventListener('click', () => {
    exportCookies();
  });

  // Delete all
  document.getElementById('delete-all-btn').addEventListener('click', () => {
    if (confirm(`Delete all ${allCookies.length} cookies?`)) {
      browserAPI.runtime.sendMessage({ 
        type: 'DELETE_ALL_COOKIES', 
        url: window.location.href
      }, () => {
        loadCookies();
        document.getElementById('cookie-details').style.display = 'none';
      });
    }
  });

  // Save cookie
  document.getElementById('save-cookie-btn').addEventListener('click', () => {
    const name = document.getElementById('edit-name').value.trim();
    const value = document.getElementById('edit-value').value;
    const domain = document.getElementById('edit-domain').value.trim();
    const path = document.getElementById('edit-path').value.trim() || '/';
    
    if (!name) {
      alert('Cookie name is required');
      return;
    }
    
    if (!domain) {
      alert('Cookie domain is required');
      return;
    }

    const cookieData = {
      name: name,
      value: value,
      domain: domain,
      path: path,
      secure: document.getElementById('edit-secure').checked,
      httpOnly: document.getElementById('edit-httponly').checked,
      sameSite: document.getElementById('edit-samesite').value
    };

    // Add expiration if not a session cookie
    if (!document.getElementById('edit-session').checked) {
      const expiresInput = document.getElementById('edit-expires').value;
      if (expiresInput) {
        const expires = new Date(expiresInput);
        cookieData.expirationDate = Math.floor(expires.getTime() / 1000);
      }
    }

    console.log('Saving cookie:', cookieData);

    browserAPI.runtime.sendMessage({ 
      type: 'SET_COOKIE', 
      url: window.location.href,
      cookie: cookieData
    }, (response) => {
      if (response && response.success) {
        console.log('Cookie saved successfully');
        setTimeout(() => {
          loadCookies();
          document.getElementById('cookie-details').style.display = 'none';
        }, 300);
      } else {
        console.error('Failed to save cookie:', response?.error);
        alert('Failed to save cookie: ' + (response?.error || 'Unknown error'));
      }
    });
  });

  // Cancel edit
  document.getElementById('cancel-edit-btn').addEventListener('click', () => {
    document.getElementById('cookie-details').style.display = 'none';
    selectedCookie = null;
  });

  // Delete cookie button
  document.getElementById('delete-cookie-btn').addEventListener('click', () => {
    if (selectedCookie && confirm(`Delete cookie "${selectedCookie.name}"?`)) {
      deleteCookie(selectedCookie.name, selectedCookie.domain);
    }
  });

  // Close panel
  document.getElementById('close-cookie-panel').addEventListener('click', () => {
    panel.remove();
    // Turn off toggle
    browserAPI.storage.sync.set({ editCookie: false });
  });

  // Hover effect for close button
  const closeBtn = document.getElementById('close-cookie-panel');
  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.background = '#374151';
    closeBtn.style.color = '#fff';
  });
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.background = 'none';
    closeBtn.style.color = '#9CA3AF';
  });

  // Hover effects for action buttons
  const actionButtons = [
    { id: 'add-cookie-btn', hoverBg: 'rgba(59, 130, 246, 0.3)' },
    { id: 'import-cookies-btn', hoverBg: 'rgba(59, 130, 246, 0.3)' },
    { id: 'export-cookies-btn', hoverBg: 'rgba(59, 130, 246, 0.3)' },
    { id: 'delete-all-btn', hoverBg: 'rgba(239, 68, 68, 0.3)' },
    { id: 'save-cookie-btn', hoverBg: 'rgba(59, 130, 246, 0.3)' },
    { id: 'delete-cookie-btn', hoverBg: 'rgba(239, 68, 68, 0.3)' },
    { id: 'cancel-edit-btn', hoverBg: 'rgba(107, 114, 128, 0.3)' }
  ];

  actionButtons.forEach(({ id, hoverBg }) => {
    const btn = document.getElementById(id);
    if (btn) {
      const originalBg = btn.style.background;
      btn.addEventListener('mouseenter', () => {
        btn.style.background = hoverBg;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.background = originalBg;
      });
    }
  });

  // Session checkbox toggle
  document.getElementById('edit-session').addEventListener('change', (e) => {
    document.getElementById('edit-expires').disabled = e.target.checked;
  });

  // Initial load
  loadCookies();

  return {
    cleanup: () => panel.remove()
  };
}


// ========== check-seo.js ==========
// SEO & Performance Checker Feature - Comprehensive like Checkbot
function initCheckSEO() {
  const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
  
  // Dragging state
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let panelStartX = 0;
  let panelStartY = 0;

  // Resizing state
  let isResizing = false;
  let resizeStartX = 0;
  let resizeStartY = 0;
  let panelStartWidth = 0;
  let panelStartHeight = 0;

  // Analysis results
  let analysisResults = {
    overview: { pass: 0, warn: 0, fail: 0 },
    seo: [],
    performance: [],
    security: [],
    accessibility: []
  };

  const panel = document.createElement('div');
  panel.id = 'seo-checker-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 800px;
    height: 600px;
    min-width: 600px;
    min-height: 400px;
    max-width: 95vw;
    max-height: 95vh;
    background: #1F2937;
    border-radius: 12px;
    border: 1px solid #374151;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    z-index: 999999;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color: #E5E7EB;
    overflow: hidden;
  `;

  panel.innerHTML = `
    <div id="seo-header" style="background: #111827; padding: 16px; border-radius: 12px 12px 0 0; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #374151; cursor: move; user-select: none;">
      <div style="font-weight: 600; font-size: 16px; color: #E5E7EB;">SEO & Performance Checker</div>
      <button id="close-seo-panel" style="background: none; border: none; color: #9CA3AF; cursor: pointer; font-size: 24px; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: all 0.2s;">×</button>
    </div>

    <div style="display: flex; background: #111827; border-bottom: 1px solid #374151; padding: 0 16px;">
      <button class="tab-btn active" data-tab="overview" style="padding: 12px 20px; background: none; border: none; color: #9CA3AF; cursor: pointer; font-size: 14px; font-weight: 500; border-bottom: 2px solid transparent; transition: all 0.2s;">Overview</button>
      <button class="tab-btn" data-tab="seo" style="padding: 12px 20px; background: none; border: none; color: #9CA3AF; cursor: pointer; font-size: 14px; font-weight: 500; border-bottom: 2px solid transparent; transition: all 0.2s;">SEO</button>
      <button class="tab-btn" data-tab="performance" style="padding: 12px 20px; background: none; border: none; color: #9CA3AF; cursor: pointer; font-size: 14px; font-weight: 500; border-bottom: 2px solid transparent; transition: all 0.2s;">Performance</button>
      <button class="tab-btn" data-tab="security" style="padding: 12px 20px; background: none; border: none; color: #9CA3AF; cursor: pointer; font-size: 14px; font-weight: 500; border-bottom: 2px solid transparent; transition: all 0.2s;">Security</button>
      <button class="tab-btn" data-tab="accessibility" style="padding: 12px 20px; background: none; border: none; color: #9CA3AF; cursor: pointer; font-size: 14px; font-weight: 500; border-bottom: 2px solid transparent; transition: all 0.2s;">Accessibility</button>
    </div>

    <div style="flex: 1; overflow-y: auto; padding: 20px;">
      <div id="tab-content-overview" class="tab-content">
        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #E5E7EB;">Analysis Summary</h3>
          
          <!-- Performance Meters -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
            <!-- Overall Score Circle -->
            <div style="display: flex; align-items: center; justify-content: center; background: #111827; padding: 30px; border-radius: 12px; border: 1px solid #374151;">
              <div style="position: relative; width: 180px; height: 180px;">
                <svg width="180" height="180" style="transform: rotate(-90deg);">
                  <circle cx="90" cy="90" r="75" fill="none" stroke="#374151" stroke-width="12"/>
                  <circle id="overall-circle" cx="90" cy="90" r="75" fill="none" stroke="#3B82F6" stroke-width="12" stroke-dasharray="471" stroke-dashoffset="471" stroke-linecap="round" style="transition: stroke-dashoffset 1s ease, stroke 0.3s ease;"/>
                </svg>
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                  <div id="overall-score" style="font-size: 48px; font-weight: 700; color: #E5E7EB; line-height: 1;">0%</div>
                  <div style="font-size: 13px; color: #9CA3AF; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Overall</div>
                </div>
              </div>
            </div>

            <!-- Category Scores -->
            <div style="display: flex; flex-direction: column; gap: 16px;">
              <div style="background: #111827; padding: 16px; border-radius: 8px; border: 1px solid #374151;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span style="font-size: 14px; color: #E5E7EB; font-weight: 500;">SEO</span>
                  <span id="seo-score" style="font-size: 18px; font-weight: 700; color: #3B82F6;">0%</span>
                </div>
                <div style="height: 8px; background: #374151; border-radius: 4px; overflow: hidden;">
                  <div id="seo-bar" style="height: 100%; width: 0%; background: linear-gradient(90deg, #3B82F6, #60A5FA); transition: width 1s ease, background 0.3s ease; border-radius: 4px;"></div>
                </div>
              </div>

              <div style="background: #111827; padding: 16px; border-radius: 8px; border: 1px solid #374151;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span style="font-size: 14px; color: #E5E7EB; font-weight: 500;">Performance</span>
                  <span id="performance-score" style="font-size: 18px; font-weight: 700; color: #3B82F6;">0%</span>
                </div>
                <div style="height: 8px; background: #374151; border-radius: 4px; overflow: hidden;">
                  <div id="performance-bar" style="height: 100%; width: 0%; background: linear-gradient(90deg, #3B82F6, #60A5FA); transition: width 1s ease, background 0.3s ease; border-radius: 4px;"></div>
                </div>
              </div>

              <div style="background: #111827; padding: 16px; border-radius: 8px; border: 1px solid #374151;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span style="font-size: 14px; color: #E5E7EB; font-weight: 500;">Security</span>
                  <span id="security-score" style="font-size: 18px; font-weight: 700; color: #3B82F6;">0%</span>
                </div>
                <div style="height: 8px; background: #374151; border-radius: 4px; overflow: hidden;">
                  <div id="security-bar" style="height: 100%; width: 0%; background: linear-gradient(90deg, #3B82F6, #60A5FA); transition: width 1s ease, background 0.3s ease; border-radius: 4px;"></div>
                </div>
              </div>

              <div style="background: #111827; padding: 16px; border-radius: 8px; border: 1px solid #374151;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span style="font-size: 14px; color: #E5E7EB; font-weight: 500;">Accessibility</span>
                  <span id="accessibility-score" style="font-size: 18px; font-weight: 700; color: #3B82F6;">0%</span>
                </div>
                <div style="height: 8px; background: #374151; border-radius: 4px; overflow: hidden;">
                  <div id="accessibility-bar" style="height: 100%; width: 0%; background: linear-gradient(90deg, #3B82F6, #60A5FA); transition: width 1s ease, background 0.3s ease; border-radius: 4px;"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Stats Grid -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
            <div style="background: #111827; padding: 20px; border-radius: 8px; border: 1px solid #374151; text-align: center;">
              <div style="font-size: 36px; font-weight: 700; color: #10B981; margin-bottom: 4px;" id="pass-count">0</div>
              <div style="font-size: 13px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.5px;">Passed</div>
            </div>
            <div style="background: #111827; padding: 20px; border-radius: 8px; border: 1px solid #374151; text-align: center;">
              <div style="font-size: 36px; font-weight: 700; color: #F59E0B; margin-bottom: 4px;" id="warn-count">0</div>
              <div style="font-size: 13px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.5px;">Warnings</div>
            </div>
            <div style="background: #111827; padding: 20px; border-radius: 8px; border: 1px solid #374151; text-align: center;">
              <div style="font-size: 36px; font-weight: 700; color: #EF4444; margin-bottom: 4px;" id="fail-count">0</div>
              <div style="font-size: 13px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.5px;">Failed</div>
            </div>
          </div>

          <!-- Page Statistics -->
          <div style="background: #111827; padding: 20px; border-radius: 8px; border: 1px solid #374151; margin-bottom: 24px;">
            <h4 style="font-size: 14px; font-weight: 600; color: #E5E7EB; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Page Statistics</h4>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
              <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #374151;">
                <span style="font-size: 13px; color: #9CA3AF;">Images</span>
                <span id="stat-images" style="font-size: 14px; color: #60A5FA; font-weight: 600;">0</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #374151;">
                <span style="font-size: 13px; color: #9CA3AF;">Links</span>
                <span id="stat-links" style="font-size: 14px; color: #60A5FA; font-weight: 600;">0</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #374151;">
                <span style="font-size: 13px; color: #9CA3AF;">CSS Files</span>
                <span id="stat-css" style="font-size: 14px; color: #60A5FA; font-weight: 600;">0</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #374151;">
                <span style="font-size: 13px; color: #9CA3AF;">JavaScript Files</span>
                <span id="stat-js" style="font-size: 14px; color: #60A5FA; font-weight: 600;">0</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #374151;">
                <span style="font-size: 13px; color: #9CA3AF;">Headings</span>
                <span id="stat-headings" style="font-size: 14px; color: #60A5FA; font-weight: 600;">0</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #374151;">
                <span style="font-size: 13px; color: #9CA3AF;">Forms</span>
                <span id="stat-forms" style="font-size: 14px; color: #60A5FA; font-weight: 600;">0</span>
              </div>
            </div>
          </div>
        </div>
        <div id="overview-details"></div>
      </div>

      <div id="tab-content-seo" class="tab-content" style="display: none;"></div>
      <div id="tab-content-performance" class="tab-content" style="display: none;"></div>
      <div id="tab-content-security" class="tab-content" style="display: none;"></div>
      <div id="tab-content-accessibility" class="tab-content" style="display: none;"></div>
    </div>
  `;

  document.body.appendChild(panel);

  // Add resize handle
  const resizeHandle = document.createElement('div');
  resizeHandle.id = 'resize-handle-seo';
  resizeHandle.style.cssText = `
    position: absolute;
    bottom: 0;
    right: 0;
    width: 20px;
    height: 20px;
    cursor: nwse-resize;
    background: linear-gradient(135deg, transparent 50%, #666 50%);
    border-radius: 0 0 12px 0;
    z-index: 10;
  `;
  panel.appendChild(resizeHandle);

  // Make panel draggable
  const header = document.getElementById('seo-header');
  
  header.addEventListener('mousedown', (e) => {
    if (e.target.id === 'close-seo-panel' || e.target.closest('#close-seo-panel')) {
      return;
    }
    
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    
    const rect = panel.getBoundingClientRect();
    panelStartX = rect.left;
    panelStartY = rect.top;
    
    panel.style.transform = 'none';
    panel.style.left = panelStartX + 'px';
    panel.style.top = panelStartY + 'px';
    
    header.style.cursor = 'grabbing';
    e.preventDefault();
  });

  // Make panel resizable
  resizeHandle.addEventListener('mousedown', (e) => {
    isResizing = true;
    resizeStartX = e.clientX;
    resizeStartY = e.clientY;
    
    panelStartWidth = panel.offsetWidth;
    panelStartHeight = panel.offsetHeight;
    
    e.preventDefault();
    e.stopPropagation();
  });

  // Mouse move handler
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStartX;
      const deltaY = e.clientY - dragStartY;
      
      let newX = panelStartX + deltaX;
      let newY = panelStartY + deltaY;
      
      const maxX = window.innerWidth - panel.offsetWidth;
      const maxY = window.innerHeight - panel.offsetHeight;
      
      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));
      
      panel.style.left = newX + 'px';
      panel.style.top = newY + 'px';
    }
    
    if (isResizing) {
      const deltaX = e.clientX - resizeStartX;
      const deltaY = e.clientY - resizeStartY;
      
      let newWidth = panelStartWidth + deltaX;
      let newHeight = panelStartHeight + deltaY;
      
      newWidth = Math.max(600, Math.min(newWidth, window.innerWidth * 0.95));
      newHeight = Math.max(400, Math.min(newHeight, window.innerHeight * 0.95));
      
      panel.style.width = newWidth + 'px';
      panel.style.height = newHeight + 'px';
    }
  });

  // Mouse up handler
  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      header.style.cursor = 'move';
    }
    if (isResizing) {
      isResizing = false;
    }
  });

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      
      // Update active tab button
      document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active');
        b.style.color = '#9CA3AF';
        b.style.borderBottomColor = 'transparent';
      });
      btn.classList.add('active');
      btn.style.color = '#60A5FA';
      btn.style.borderBottomColor = '#3B82F6';
      
      // Show corresponding content
      document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
      });
      document.getElementById(`tab-content-${tab}`).style.display = 'block';
    });
  });

  // Close panel
  document.getElementById('close-seo-panel').addEventListener('click', () => {
    panel.remove();
    browserAPI.storage.sync.set({ checkSeo: false });
  });

  // Hover effect for close button
  const closeBtn = document.getElementById('close-seo-panel');
  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.background = '#374151';
    closeBtn.style.color = '#fff';
  });
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.background = 'none';
    closeBtn.style.color = '#9CA3AF';
  });

  // Analysis functions
  function analyzeSEO() {
    const checks = [];
    
    // Title check
    const title = document.querySelector('title');
    if (title && title.textContent.trim()) {
      const titleLength = title.textContent.trim().length;
      if (titleLength >= 30 && titleLength <= 60) {
        checks.push({
          status: 'pass',
          title: 'Page Title',
          value: title.textContent.trim(),
          message: 'Title length is optimal (30-60 characters)',
          improve: ''
        });
      } else {
        checks.push({
          status: 'warn',
          title: 'Page Title',
          value: title.textContent.trim(),
          message: `Title length is ${titleLength} characters`,
          improve: 'Keep your title between 30-60 characters for optimal display in search results. Titles that are too short may not be descriptive enough, while titles that are too long will be truncated.'
        });
      }
    } else {
      checks.push({
        status: 'fail',
        title: 'Page Title',
        value: 'Missing',
        message: 'No title tag found',
        improve: 'Add a <title> tag in the <head> section. The title should be unique, descriptive, and between 30-60 characters. It appears in search results and browser tabs.'
      });
    }

    // Meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && metaDesc.content.trim()) {
      const descLength = metaDesc.content.trim().length;
      if (descLength >= 120 && descLength <= 160) {
        checks.push({
          status: 'pass',
          title: 'Meta Description',
          value: metaDesc.content.trim(),
          message: 'Description length is optimal (120-160 characters)',
          improve: ''
        });
      } else {
        checks.push({
          status: 'warn',
          title: 'Meta Description',
          value: metaDesc.content.trim(),
          message: `Description length is ${descLength} characters`,
          improve: 'Keep your meta description between 120-160 characters. This text appears in search results below your title and should accurately summarize your page content.'
        });
      }
    } else {
      checks.push({
        status: 'fail',
        title: 'Meta Description',
        value: 'Missing',
        message: 'No meta description found',
        improve: 'Add a <meta name="description" content="..."> tag in the <head> section. Write a compelling 120-160 character summary that encourages clicks from search results.'
      });
    }

    // H1 headings
    const h1s = document.querySelectorAll('h1');
    if (h1s.length === 1) {
      checks.push({
        status: 'pass',
        title: 'H1 Heading',
        value: h1s[0].textContent.trim().substring(0, 100),
        message: 'One H1 heading found',
        improve: ''
      });
    } else if (h1s.length === 0) {
      checks.push({
        status: 'fail',
        title: 'H1 Heading',
        value: 'Missing',
        message: 'No H1 heading found',
        improve: 'Add exactly one <h1> tag to your page. The H1 should contain your main keyword and clearly describe the page content. It helps search engines understand your page topic.'
      });
    } else {
      checks.push({
        status: 'warn',
        title: 'H1 Heading',
        value: `${h1s.length} H1 tags found`,
        message: 'Multiple H1 headings found',
        improve: 'Use only one <h1> tag per page. Multiple H1s can confuse search engines about your page\'s main topic. Use <h2>, <h3>, etc. for subheadings.'
      });
    }

    // Images with alt text
    const images = document.querySelectorAll('img');
    const imagesWithoutAlt = Array.from(images).filter(img => !img.alt || img.alt.trim() === '');
    if (images.length > 0) {
      if (imagesWithoutAlt.length === 0) {
        checks.push({
          status: 'pass',
          title: 'Image Alt Text',
          value: `${images.length} images, all have alt text`,
          message: 'All images have alt attributes',
          improve: ''
        });
      } else {
        checks.push({
          status: 'warn',
          title: 'Image Alt Text',
          value: `${imagesWithoutAlt.length} of ${images.length} images missing alt text`,
          message: 'Some images are missing alt attributes',
          improve: 'Add descriptive alt text to all images. Alt text helps search engines understand image content and improves accessibility for screen readers. Describe what the image shows in 10-15 words.'
        });
      }
    }

    // Canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical && canonical.href) {
      checks.push({
        status: 'pass',
        title: 'Canonical URL',
        value: canonical.href,
        message: 'Canonical URL is set',
        improve: ''
      });
    } else {
      checks.push({
        status: 'warn',
        title: 'Canonical URL',
        value: 'Not set',
        message: 'No canonical URL found',
        improve: 'Add a <link rel="canonical" href="..."> tag to specify the preferred URL for this page. This prevents duplicate content issues when the same content is accessible via multiple URLs.'
      });
    }

    // Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    const ogCount = [ogTitle, ogDesc, ogImage].filter(Boolean).length;
    
    if (ogCount === 3) {
      checks.push({
        status: 'pass',
        title: 'Open Graph Tags',
        value: 'All essential tags present',
        message: 'og:title, og:description, og:image found',
        improve: ''
      });
    } else if (ogCount > 0) {
      checks.push({
        status: 'warn',
        title: 'Open Graph Tags',
        value: `${ogCount} of 3 essential tags found`,
        message: 'Some Open Graph tags are missing',
        improve: 'Add og:title, og:description, and og:image meta tags. These control how your page appears when shared on social media platforms like Facebook, LinkedIn, and Slack.'
      });
    } else {
      checks.push({
        status: 'fail',
        title: 'Open Graph Tags',
        value: 'Missing',
        message: 'No Open Graph tags found',
        improve: 'Add Open Graph meta tags (og:title, og:description, og:image) to control how your page appears when shared on social media. This significantly improves click-through rates from social platforms.'
      });
    }

    // Robots meta tag
    const robots = document.querySelector('meta[name="robots"]');
    if (robots) {
      const content = robots.content.toLowerCase();
      if (content.includes('noindex') || content.includes('nofollow')) {
        checks.push({
          status: 'warn',
          title: 'Robots Meta Tag',
          value: robots.content,
          message: 'Page has indexing restrictions',
          improve: 'Your robots meta tag contains "noindex" or "nofollow". This prevents search engines from indexing your page or following links. Remove these directives if you want this page to appear in search results.'
        });
      } else {
        checks.push({
          status: 'pass',
          title: 'Robots Meta Tag',
          value: robots.content,
          message: 'Robots tag allows indexing',
          improve: ''
        });
      }
    }

    // Structured data
    const jsonLd = document.querySelectorAll('script[type="application/ld+json"]');
    if (jsonLd.length > 0) {
      checks.push({
        status: 'pass',
        title: 'Structured Data',
        value: `${jsonLd.length} schema(s) found`,
        message: 'Structured data is present',
        improve: ''
      });
    } else {
      checks.push({
        status: 'warn',
        title: 'Structured Data',
        value: 'Not found',
        message: 'No structured data detected',
        improve: 'Add JSON-LD structured data to help search engines better understand your content. Use Schema.org vocabulary to mark up products, articles, events, reviews, and other content types for rich search results.'
      });
    }

    // Language declaration
    const htmlLang = document.documentElement.lang;
    if (htmlLang && htmlLang.trim()) {
      checks.push({
        status: 'pass',
        title: 'Language Declaration',
        value: htmlLang,
        message: 'Page language is declared',
        improve: ''
      });
    } else {
      checks.push({
        status: 'warn',
        title: 'Language Declaration',
        value: 'Not set',
        message: 'No language attribute on <html> tag',
        improve: 'Add a lang attribute to your <html> tag (e.g., <html lang="en">). This helps search engines understand your content language and improves accessibility for screen readers.'
      });
    }

    return checks;
  }

  function analyzePerformance() {
    const checks = [];
    
    // Page load time (using Navigation Timing API)
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      
      if (loadTime < 3000) {
        checks.push({
          status: 'pass',
          title: 'Page Load Time',
          value: `${(loadTime / 1000).toFixed(2)}s`,
          message: 'Page loads quickly',
          improve: ''
        });
      } else if (loadTime < 5000) {
        checks.push({
          status: 'warn',
          title: 'Page Load Time',
          value: `${(loadTime / 1000).toFixed(2)}s`,
          message: 'Page load time is moderate',
          improve: 'Optimize your page to load in under 3 seconds. Compress images, minify CSS/JS, enable browser caching, use a CDN, and consider lazy loading for below-the-fold content.'
        });
      } else {
        checks.push({
          status: 'fail',
          title: 'Page Load Time',
          value: `${(loadTime / 1000).toFixed(2)}s`,
          message: 'Page loads slowly',
          improve: 'Your page takes over 5 seconds to load. This significantly impacts user experience and SEO. Prioritize: image optimization, code minification, server response time, and removing render-blocking resources.'
        });
      }
    }

    // Image optimization
    const images = document.querySelectorAll('img');
    const largeImages = Array.from(images).filter(img => {
      return img.naturalWidth > 2000 || img.naturalHeight > 2000;
    });
    
    if (images.length > 0) {
      if (largeImages.length === 0) {
        checks.push({
          status: 'pass',
          title: 'Image Sizes',
          value: `${images.length} images checked`,
          message: 'No oversized images detected',
          improve: ''
        });
      } else {
        checks.push({
          status: 'warn',
          title: 'Image Sizes',
          value: `${largeImages.length} oversized images found`,
          message: 'Some images are very large',
          improve: 'Resize images to appropriate dimensions before uploading. Use responsive images with srcset, compress images (aim for <200KB), and consider modern formats like WebP for better compression.'
        });
      }
    }

    // CSS files
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
    if (cssLinks.length <= 3) {
      checks.push({
        status: 'pass',
        title: 'CSS Files',
        value: `${cssLinks.length} stylesheet(s)`,
        message: 'Reasonable number of CSS files',
        improve: ''
      });
    } else {
      checks.push({
        status: 'warn',
        title: 'CSS Files',
        value: `${cssLinks.length} stylesheet(s)`,
        message: 'Many CSS files detected',
        improve: 'Combine multiple CSS files into one to reduce HTTP requests. Minify CSS, remove unused styles, and consider inlining critical CSS for above-the-fold content.'
      });
    }

    // JavaScript files
    const scripts = document.querySelectorAll('script[src]');
    if (scripts.length <= 5) {
      checks.push({
        status: 'pass',
        title: 'JavaScript Files',
        value: `${scripts.length} script(s)`,
        message: 'Reasonable number of JS files',
        improve: ''
      });
    } else {
      checks.push({
        status: 'warn',
        title: 'JavaScript Files',
        value: `${scripts.length} script(s)`,
        message: 'Many JavaScript files detected',
        improve: 'Combine and minify JavaScript files. Use async or defer attributes to prevent render blocking. Consider code splitting to load only necessary scripts per page.'
      });
    }

    // Inline styles
    const elementsWithStyle = document.querySelectorAll('[style]');
    if (elementsWithStyle.length < 10) {
      checks.push({
        status: 'pass',
        title: 'Inline Styles',
        value: `${elementsWithStyle.length} elements`,
        message: 'Minimal inline styles',
        improve: ''
      });
    } else {
      checks.push({
        status: 'warn',
        title: 'Inline Styles',
        value: `${elementsWithStyle.length} elements`,
        message: 'Many inline styles detected',
        improve: 'Move inline styles to external CSS files. This improves caching, reduces HTML size, and makes maintenance easier. Use CSS classes instead of inline style attributes.'
      });
    }

    // Viewport meta tag
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      checks.push({
        status: 'pass',
        title: 'Mobile Viewport',
        value: viewport.content,
        message: 'Viewport meta tag is present',
        improve: ''
      });
    } else {
      checks.push({
        status: 'fail',
        title: 'Mobile Viewport',
        value: 'Missing',
        message: 'No viewport meta tag found',
        improve: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to the <head>. This ensures your page displays correctly on mobile devices and is required for mobile-friendly ranking.'
      });
    }

    return checks;
  }

  function analyzeSecurity() {
    const checks = [];
    
    // HTTPS
    if (window.location.protocol === 'https:') {
      checks.push({
        status: 'pass',
        title: 'HTTPS',
        value: 'Enabled',
        message: 'Page is served over HTTPS',
        improve: ''
      });
    } else {
      checks.push({
        status: 'fail',
        title: 'HTTPS',
        value: 'Not enabled',
        message: 'Page is not served over HTTPS',
        improve: 'Enable HTTPS for your entire site. HTTPS encrypts data between users and your server, protects against man-in-the-middle attacks, and is required for many modern web features. It\'s also a ranking factor.'
      });
    }

    // Mixed content
    const httpResources = Array.from(document.querySelectorAll('img[src^="http:"], script[src^="http:"], link[href^="http:"]'));
    if (window.location.protocol === 'https:' && httpResources.length > 0) {
      checks.push({
        status: 'warn',
        title: 'Mixed Content',
        value: `${httpResources.length} insecure resource(s)`,
        message: 'HTTP resources on HTTPS page',
        improve: 'Replace all HTTP URLs with HTTPS. Mixed content (HTTP resources on HTTPS pages) can be blocked by browsers and creates security vulnerabilities. Update all resource URLs to use HTTPS.'
      });
    } else {
      checks.push({
        status: 'pass',
        title: 'Mixed Content',
        value: 'None detected',
        message: 'No mixed content issues',
        improve: ''
      });
    }

    // Content Security Policy
    const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (csp) {
      checks.push({
        status: 'pass',
        title: 'Content Security Policy',
        value: 'Implemented',
        message: 'CSP header is present',
        improve: ''
      });
    } else {
      checks.push({
        status: 'warn',
        title: 'Content Security Policy',
        value: 'Not found',
        message: 'No CSP detected',
        improve: 'Implement Content Security Policy headers to prevent XSS attacks, clickjacking, and other code injection attacks. Start with a report-only policy to test before enforcing.'
      });
    }

    // X-Frame-Options
    checks.push({
      status: 'warn',
      title: 'Clickjacking Protection',
      value: 'Cannot verify from client',
      message: 'X-Frame-Options header check requires server',
      improve: 'Ensure X-Frame-Options or CSP frame-ancestors is set on your server to prevent clickjacking attacks. Use "SAMEORIGIN" to allow framing only from same origin, or "DENY" to block all framing.'
    });

    // Inline JavaScript
    const inlineScripts = document.querySelectorAll('script:not([src])');
    const inlineEventHandlers = document.querySelectorAll('[onclick], [onload], [onerror]');
    const totalInline = inlineScripts.length + inlineEventHandlers.length;
    
    if (totalInline < 5) {
      checks.push({
        status: 'pass',
        title: 'Inline JavaScript',
        value: `${totalInline} instance(s)`,
        message: 'Minimal inline JavaScript',
        improve: ''
      });
    } else {
      checks.push({
        status: 'warn',
        title: 'Inline JavaScript',
        value: `${totalInline} instance(s)`,
        message: 'Multiple inline scripts detected',
        improve: 'Move inline JavaScript to external files. This improves security (enables stricter CSP), caching, and code maintainability. Avoid inline event handlers like onclick.'
      });
    }

    return checks;
  }

  function analyzeAccessibility() {
    const checks = [];
    
    // Alt text on images
    const images = document.querySelectorAll('img');
    const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
    
    if (images.length > 0) {
      if (imagesWithoutAlt.length === 0) {
        checks.push({
          status: 'pass',
          title: 'Image Alt Text',
          value: `${images.length} images checked`,
          message: 'All images have alt attributes',
          improve: ''
        });
      } else {
        checks.push({
          status: 'fail',
          title: 'Image Alt Text',
          value: `${imagesWithoutAlt.length} missing alt text`,
          message: 'Some images lack alt attributes',
          improve: 'Add alt text to all images. Screen readers use alt text to describe images to visually impaired users. Decorative images should have empty alt="" attributes.'
        });
      }
    }

    // Form labels
    const inputs = document.querySelectorAll('input:not([type="hidden"]), textarea, select');
    const inputsWithoutLabels = Array.from(inputs).filter(input => {
      const id = input.id;
      const hasLabel = id && document.querySelector(`label[for="${id}"]`);
      const hasAriaLabel = input.getAttribute('aria-label');
      return !hasLabel && !hasAriaLabel;
    });
    
    if (inputs.length > 0) {
      if (inputsWithoutLabels.length === 0) {
        checks.push({
          status: 'pass',
          title: 'Form Labels',
          value: `${inputs.length} inputs checked`,
          message: 'All form inputs have labels',
          improve: ''
        });
      } else {
        checks.push({
          status: 'fail',
          title: 'Form Labels',
          value: `${inputsWithoutLabels.length} inputs without labels`,
          message: 'Some form inputs lack labels',
          improve: 'Associate every form input with a <label> element using the for attribute, or use aria-label. This helps screen reader users understand what each field is for.'
        });
      }
    }

    // Heading hierarchy
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const headingLevels = headings.map(h => parseInt(h.tagName[1]));
    let hierarchyIssue = false;
    
    for (let i = 1; i < headingLevels.length; i++) {
      if (headingLevels[i] - headingLevels[i-1] > 1) {
        hierarchyIssue = true;
        break;
      }
    }
    
    if (headings.length > 0) {
      if (!hierarchyIssue) {
        checks.push({
          status: 'pass',
          title: 'Heading Hierarchy',
          value: `${headings.length} headings checked`,
          message: 'Heading structure is logical',
          improve: ''
        });
      } else {
        checks.push({
          status: 'warn',
          title: 'Heading Hierarchy',
          value: 'Hierarchy issues detected',
          message: 'Heading levels are skipped',
          improve: 'Maintain proper heading hierarchy (h1 → h2 → h3). Don\'t skip levels (e.g., h1 → h3). This helps screen reader users navigate your content structure.'
        });
      }
    }

    // Link text
    const links = document.querySelectorAll('a[href]');
    const vagueLinkText = ['click here', 'read more', 'here', 'more', 'link'];
    const vagueLinks = Array.from(links).filter(link => {
      const text = link.textContent.trim().toLowerCase();
      return vagueLinkText.includes(text);
    });
    
    if (links.length > 0) {
      if (vagueLinks.length === 0) {
        checks.push({
          status: 'pass',
          title: 'Link Text',
          value: `${links.length} links checked`,
          message: 'Link text is descriptive',
          improve: ''
        });
      } else {
        checks.push({
          status: 'warn',
          title: 'Link Text',
          value: `${vagueLinks.length} vague links found`,
          message: 'Some links have non-descriptive text',
          improve: 'Use descriptive link text that makes sense out of context. Avoid generic phrases like "click here" or "read more". Screen reader users often navigate by links alone.'
        });
      }
    }

    // Color contrast (basic check)
    checks.push({
      status: 'warn',
      title: 'Color Contrast',
      value: 'Manual check recommended',
      message: 'Automated contrast checking is limited',
      improve: 'Ensure text has sufficient contrast against backgrounds (4.5:1 for normal text, 3:1 for large text). Use tools like WebAIM Contrast Checker or browser DevTools to verify contrast ratios.'
    });

    return checks;
  }

  // Render check item
  function renderCheckItem(check) {
    const statusColors = {
      pass: { bg: 'rgba(16, 185, 129, 0.1)', border: '#10B981', text: '#10B981', icon: '✓' },
      warn: { bg: 'rgba(245, 158, 11, 0.1)', border: '#F59E0B', text: '#F59E0B', icon: '⚠' },
      fail: { bg: 'rgba(239, 68, 68, 0.1)', border: '#EF4444', text: '#EF4444', icon: '✕' }
    };
    
    const color = statusColors[check.status];
    const hasImprove = check.improve && check.improve.trim();
    
    const item = document.createElement('div');
    item.style.cssText = `
      background: #111827;
      border: 1px solid #374151;
      border-left: 3px solid ${color.border};
      border-radius: 8px;
      margin-bottom: 12px;
      overflow: hidden;
    `;
    
    item.innerHTML = `
      <div class="check-header" style="padding: 16px; cursor: ${hasImprove ? 'pointer' : 'default'}; user-select: none;">
        <div style="display: flex; align-items: start; gap: 12px;">
          <div style="width: 24px; height: 24px; border-radius: 50%; background: ${color.bg}; border: 2px solid ${color.border}; display: flex; align-items: center; justify-content: center; color: ${color.text}; font-weight: bold; font-size: 14px; flex-shrink: 0;">
            ${color.icon}
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <div style="font-weight: 600; font-size: 14px; color: #E5E7EB;">${check.title}</div>
              ${hasImprove ? '<div style="color: #9CA3AF; font-size: 18px; transform: rotate(0deg); transition: transform 0.2s;">›</div>' : ''}
            </div>
            <div style="font-size: 13px; color: #9CA3AF; margin-bottom: 4px;">${check.message}</div>
            <div style="font-size: 12px; color: #6B7280; font-family: monospace; word-break: break-all;">${check.value}</div>
          </div>
        </div>
      </div>
      ${hasImprove ? `
        <div class="check-details" style="display: none; padding: 0 16px 16px 52px; border-top: 1px solid #374151;">
          <div style="margin-top: 12px; padding: 12px; background: #1F2937; border-radius: 6px; border-left: 3px solid #3B82F6;">
            <div style="font-size: 11px; color: #60A5FA; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">How to Improve</div>
            <div style="font-size: 13px; color: #D1D5DB; line-height: 1.6;">${check.improve}</div>
          </div>
        </div>
      ` : ''}
    `;
    
    if (hasImprove) {
      const header = item.querySelector('.check-header');
      const details = item.querySelector('.check-details');
      const arrow = item.querySelector('.check-header > div > div > div:last-child');
      
      header.addEventListener('click', () => {
        const isOpen = details.style.display === 'block';
        details.style.display = isOpen ? 'none' : 'block';
        if (arrow) {
          arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(90deg)';
        }
      });
      
      header.addEventListener('mouseenter', () => {
        header.style.background = '#1F2937';
      });
      
      header.addEventListener('mouseleave', () => {
        header.style.background = 'transparent';
      });
    }
    
    return item;
  }

  // Run analysis
  function runAnalysis() {
    analysisResults.seo = analyzeSEO();
    analysisResults.performance = analyzePerformance();
    analysisResults.security = analyzeSecurity();
    analysisResults.accessibility = analyzeAccessibility();
    
    // Calculate overview stats
    const allChecks = [
      ...analysisResults.seo,
      ...analysisResults.performance,
      ...analysisResults.security,
      ...analysisResults.accessibility
    ];
    
    analysisResults.overview = {
      pass: allChecks.filter(c => c.status === 'pass').length,
      warn: allChecks.filter(c => c.status === 'warn').length,
      fail: allChecks.filter(c => c.status === 'fail').length
    };
    
    // Calculate scores for each category
    const calculateScore = (checks) => {
      if (checks.length === 0) return 100;
      const passCount = checks.filter(c => c.status === 'pass').length;
      const warnCount = checks.filter(c => c.status === 'warn').length;
      const failCount = checks.filter(c => c.status === 'fail').length;
      // Pass = 100%, Warn = 50%, Fail = 0%
      return Math.round(((passCount * 100) + (warnCount * 50)) / checks.length);
    };
    
    const seoScore = calculateScore(analysisResults.seo);
    const perfScore = calculateScore(analysisResults.performance);
    const secScore = calculateScore(analysisResults.security);
    const a11yScore = calculateScore(analysisResults.accessibility);
    const overallScore = Math.round((seoScore + perfScore + secScore + a11yScore) / 4);
    
    // Update scores with animation
    setTimeout(() => {
      updateScore('overall', overallScore);
      updateScore('seo', seoScore);
      updateScore('performance', perfScore);
      updateScore('security', secScore);
      updateScore('accessibility', a11yScore);
    }, 100);
    
    // Update stats
    document.getElementById('pass-count').textContent = analysisResults.overview.pass;
    document.getElementById('warn-count').textContent = analysisResults.overview.warn;
    document.getElementById('fail-count').textContent = analysisResults.overview.fail;
    
    // Update page statistics
    document.getElementById('stat-images').textContent = document.querySelectorAll('img').length;
    document.getElementById('stat-links').textContent = document.querySelectorAll('a[href]').length;
    document.getElementById('stat-css').textContent = document.querySelectorAll('link[rel="stylesheet"]').length;
    document.getElementById('stat-js').textContent = document.querySelectorAll('script[src]').length;
    document.getElementById('stat-headings').textContent = document.querySelectorAll('h1, h2, h3, h4, h5, h6').length;
    document.getElementById('stat-forms').textContent = document.querySelectorAll('form').length;
    
    // Render overview details
    const overviewDetails = document.getElementById('overview-details');
    overviewDetails.innerHTML = `
      <div style="margin-bottom: 16px;">
        <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #E5E7EB;">Critical Issues</h4>
        <div id="overview-critical"></div>
      </div>
      <div>
        <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #E5E7EB;">Warnings</h4>
        <div id="overview-warnings"></div>
      </div>
    `;
    
    const criticalIssues = allChecks.filter(c => c.status === 'fail');
    const warnings = allChecks.filter(c => c.status === 'warn').slice(0, 5);
    
    const criticalContainer = document.getElementById('overview-critical');
    if (criticalIssues.length > 0) {
      criticalIssues.forEach(check => {
        criticalContainer.appendChild(renderCheckItem(check));
      });
    } else {
      criticalContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #6B7280; background: #111827; border-radius: 8px; border: 1px solid #374151;">No critical issues found</div>';
    }
    
    const warningsContainer = document.getElementById('overview-warnings');
    if (warnings.length > 0) {
      warnings.forEach(check => {
        warningsContainer.appendChild(renderCheckItem(check));
      });
    } else {
      warningsContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #6B7280; background: #111827; border-radius: 8px; border: 1px solid #374151;">No warnings found</div>';
    }
    
    // Render SEO tab
    const seoContent = document.getElementById('tab-content-seo');
    seoContent.innerHTML = `
      <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #E5E7EB;">SEO Analysis</h3>
      <div id="seo-checks"></div>
    `;
    const seoChecks = document.getElementById('seo-checks');
    analysisResults.seo.forEach(check => {
      seoChecks.appendChild(renderCheckItem(check));
    });
    
    // Render Performance tab
    const perfContent = document.getElementById('tab-content-performance');
    perfContent.innerHTML = `
      <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #E5E7EB;">Performance Analysis</h3>
      <div id="performance-checks"></div>
    `;
    const perfChecks = document.getElementById('performance-checks');
    analysisResults.performance.forEach(check => {
      perfChecks.appendChild(renderCheckItem(check));
    });
    
    // Render Security tab
    const secContent = document.getElementById('tab-content-security');
    secContent.innerHTML = `
      <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #E5E7EB;">Security Analysis</h3>
      <div id="security-checks"></div>
    `;
    const secChecks = document.getElementById('security-checks');
    analysisResults.security.forEach(check => {
      secChecks.appendChild(renderCheckItem(check));
    });
    
    // Render Accessibility tab
    const a11yContent = document.getElementById('tab-content-accessibility');
    a11yContent.innerHTML = `
      <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #E5E7EB;">Accessibility Analysis</h3>
      <div id="accessibility-checks"></div>
    `;
    const a11yChecks = document.getElementById('accessibility-checks');
    analysisResults.accessibility.forEach(check => {
      a11yChecks.appendChild(renderCheckItem(check));
    });
  }

  // Update score with animation
  function updateScore(category, score) {
    const getColor = (score) => {
      if (score >= 80) return { stroke: '#10B981', gradient: 'linear-gradient(90deg, #10B981, #34D399)' };
      if (score >= 60) return { stroke: '#3B82F6', gradient: 'linear-gradient(90deg, #3B82F6, #60A5FA)' };
      if (score >= 40) return { stroke: '#F59E0B', gradient: 'linear-gradient(90deg, #F59E0B, #FBBF24)' };
      return { stroke: '#EF4444', gradient: 'linear-gradient(90deg, #EF4444, #F87171)' };
    };
    
    const color = getColor(score);
    
    if (category === 'overall') {
      const circle = document.getElementById('overall-circle');
      const scoreText = document.getElementById('overall-score');
      const circumference = 2 * Math.PI * 75;
      const offset = circumference - (score / 100) * circumference;
      
      circle.style.strokeDashoffset = offset;
      circle.style.stroke = color.stroke;
      scoreText.textContent = score + '%';
      scoreText.style.color = color.stroke;
    } else {
      const bar = document.getElementById(`${category}-bar`);
      const scoreText = document.getElementById(`${category}-score`);
      
      bar.style.width = score + '%';
      bar.style.background = color.gradient;
      scoreText.textContent = score + '%';
      scoreText.style.color = color.stroke;
    }
  }

  // Initialize active tab styling
  const activeTab = document.querySelector('.tab-btn.active');
  if (activeTab) {
    activeTab.style.color = '#60A5FA';
    activeTab.style.borderBottomColor = '#3B82F6';
  }

  // Run analysis
  runAnalysis();

  return {
    cleanup: () => panel.remove()
  };
}


// ========== focus-mode.js ==========
// Focus Mode - Remove YouTube distractions for focused learning
function initFocusMode() {
  const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
  
  if (!window.location.hostname.includes('youtube.com')) {
    return { cleanup: () => {} };
  }

  console.log('Focus Mode initialized for YouTube');

  let extensionEnabled = true;
  let showComments = false;
  let showDescription = true;
  let blockShorts = true;

  // Load saved preferences
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
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .focus-mode-title {
      font-size: 15px;
      font-weight: 600;
      flex: 1;
      color: #F9FAFB;
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
    body:not(.focus-mode-disabled).focus-mode-block-shorts ytd-reel-shelf-renderer,
    body:not(.focus-mode-disabled).focus-mode-block-shorts ytd-rich-shelf-renderer[is-shorts],
    body:not(.focus-mode-disabled).focus-mode-block-shorts [is-shorts],
    body:not(.focus-mode-disabled).focus-mode-block-shorts ytd-guide-entry-renderer:has([title="Shorts"]),
    body:not(.focus-mode-disabled).focus-mode-block-shorts ytd-mini-guide-entry-renderer:has([aria-label="Shorts"]),
    body:not(.focus-mode-disabled).focus-mode-block-shorts a[href^="/shorts"],
    body:not(.focus-mode-disabled).focus-mode-block-shorts ytd-rich-item-renderer:has(a[href^="/shorts"]),
    body:not(.focus-mode-disabled).focus-mode-block-shorts ytd-video-renderer:has(a[href^="/shorts"]),
    body:not(.focus-mode-disabled).focus-mode-block-shorts ytd-grid-video-renderer:has(a[href^="/shorts"]),
    body:not(.focus-mode-disabled).focus-mode-block-shorts ytd-compact-video-renderer:has(a[href^="/shorts"]),
    body:not(.focus-mode-disabled).focus-mode-block-shorts #shorts-container,
    body:not(.focus-mode-disabled).focus-mode-block-shorts ytd-reel-video-renderer {
      display: none !important;
    }

    /* Hide Shorts tab in channel pages */
    body:not(.focus-mode-disabled).focus-mode-block-shorts tp-yt-paper-tab:has([tab-title="Shorts"]),
    body:not(.focus-mode-disabled).focus-mode-block-shorts yt-tab-shape:has([tab-title="Shorts"]) {
      display: none !important;
    }

    /* Block navigation to Shorts */
    body:not(.focus-mode-disabled).focus-mode-block-shorts [href*="/shorts/"],
    body:not(.focus-mode-disabled).focus-mode-block-shorts [href*="youtube.com/shorts"] {
      pointer-events: none !important;
      opacity: 0 !important;
      display: none !important;
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

  // Create focus mode control panel
  const panel = document.createElement('div');
  panel.className = 'focus-mode-panel';
  panel.innerHTML = `
    <div class="focus-mode-header">
      <div class="focus-mode-logo">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
        </svg>
      </div>
      <div class="focus-mode-title">YouTube Focus Mode</div>
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
    <div class="focus-mode-footer">
      <a href="https://github.com/makaroni4/focused_youtube" target="_blank">Source code</a>
    </div>
  `;
  document.body.appendChild(panel);

  // Make panel draggable
  let isDragging = false;
  let currentX, currentY, initialX, initialY;

  const header = panel.querySelector('.focus-mode-header');
  header.addEventListener('mousedown', dragStart);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', dragEnd);

  function dragStart(e) {
    if (e.target.closest('.focus-mode-close')) return;
    initialX = e.clientX - panel.offsetLeft;
    initialY = e.clientY - panel.offsetTop;
    isDragging = true;
    panel.style.cursor = 'grabbing';
  }

  function drag(e) {
    if (!isDragging) return;
    e.preventDefault();
    currentX = e.clientX - initialX;
    currentY = e.clientY - initialY;
    panel.style.left = currentX + 'px';
    panel.style.top = currentY + 'px';
    panel.style.right = 'auto';
  }

  function dragEnd() {
    isDragging = false;
    panel.style.cursor = 'default';
  }

  // Close button
  panel.querySelector('.focus-mode-close').addEventListener('click', () => {
    panel.remove();
    browserAPI.storage.sync.set({ focusMode: false });
  });

  // Toggle switches
  panel.querySelectorAll('.focus-mode-toggle-switch').forEach(toggle => {
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

  // Update panel UI
  function updatePanelUI() {
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

    // Block Shorts if enabled
    if (blockShorts) {
      // Redirect if on shorts page
      if (window.location.pathname.includes('/shorts/')) {
        window.location.href = 'https://www.youtube.com/';
        return;
      }

      // Remove all shorts elements
      const shortsElements = document.querySelectorAll(`
        ytd-reel-shelf-renderer,
        ytd-rich-shelf-renderer[is-shorts],
        [is-shorts],
        ytd-guide-entry-renderer:has([title="Shorts"]),
        ytd-mini-guide-entry-renderer:has([aria-label="Shorts"]),
        a[href^="/shorts"],
        ytd-rich-item-renderer:has(a[href^="/shorts"]),
        ytd-video-renderer:has(a[href^="/shorts"]),
        ytd-grid-video-renderer:has(a[href^="/shorts"]),
        ytd-compact-video-renderer:has(a[href^="/shorts"]),
        #shorts-container,
        ytd-reel-video-renderer,
        tp-yt-paper-tab:has([tab-title="Shorts"]),
        yt-tab-shape:has([tab-title="Shorts"])
      `);
      shortsElements.forEach(el => el.remove());

      // Block navigation to shorts
      document.querySelectorAll('a[href*="/shorts/"], a[href*="youtube.com/shorts"]').forEach(link => {
        link.style.display = 'none';
        link.style.pointerEvents = 'none';
      });
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
  document.addEventListener('yt-navigate-finish', () => {
    applyFocusMode();
    removeDistractingElements();
  });

  // Run on load
  applyFocusMode();

  console.log('Focus Mode panel active');

  return {
    cleanup: () => {
      style.remove();
      panel.remove();
      clearInterval(cleanupInterval);
      observer.disconnect();
      document.body.classList.remove('focus-mode-disabled', 'focus-mode-show-comments', 'focus-mode-hide-description', 'focus-mode-no-infinite-scroll');
      console.log('Focus Mode disabled');
    }
  };
}


// ========== focus-detection.js ==========
// Focus Detection - Webcam-based focus monitoring
function initFocusDetection() {
  const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
  
  let panel = null;
  let videoStream = null;
  let isDetecting = false;
  let detectionInterval = null;

  // Create floating webcam panel
  function createPanel() {
    panel = document.createElement('div');
    panel.id = 'focus-detection-panel';
    panel.style.cssText = `
      position: fixed; top: 80px; right: 20px; width: 350px; min-height: 380px;
      background: linear-gradient(135deg, #1F2937 0%, #111827 100%);
      border-radius: 16px; border: 1px solid #374151;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6); z-index: 9999998;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #E5E7EB; overflow: hidden; display: flex; flex-direction: column;
      resize: both; min-width: 300px; min-height: 320px;
    `;

    panel.innerHTML = `
      <div id="focus-header" style="background: linear-gradient(135deg, #374151 0%, #1F2937 100%); padding: 16px 20px; cursor: move; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #374151; user-select: none;">
        <h2 style="margin: 0; font-size: 16px; font-weight: 600; color: #F9FAFB;">Focus Detection</h2>
        <button id="close-focus-panel" style="background: transparent; border: none; color: #9CA3AF; cursor: pointer; font-size: 24px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 6px; transition: all 0.2s;">×</button>
      </div>

      <div style="padding: 16px; flex: 1; display: flex; flex-direction: column;">
        <p style="font-size: 13px; color: #9CA3AF; margin: 0 0 16px 0;">Detect mobile phone usage via webcam every 2 seconds</p>
        
        <div style="position: relative; width: 100%; aspect-ratio: 4/3; background: #000; border-radius: 12px; overflow: hidden;">
          <video id="focus-video" autoplay playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>
          <canvas id="focus-canvas" style="display: none;"></canvas>
          <div id="camera-placeholder" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #1F2937;">
            <div style="text-align: center; color: #6B7280;">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 12px;">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <div style="font-size: 14px;">Camera Off</div>
            </div>
          </div>
        </div>
      </div>

      <div id="resize-handle-focus" style="position: absolute; bottom: 0; right: 0; width: 20px; height: 20px; cursor: nwse-resize; background: linear-gradient(135deg, transparent 50%, #374151 50%); border-radius: 0 0 16px 0;"></div>
    `;

    document.body.appendChild(panel);
    attachEventListeners();
    makeDraggable();
    makeResizable();
    startWebcam();
  }

  // Start webcam
  async function startWebcam() {
    try {
      videoStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 },
        audio: false 
      });
      
      const video = panel.querySelector('#focus-video');
      const placeholder = panel.querySelector('#camera-placeholder');
      
      if (video && videoStream) {
        video.srcObject = videoStream;
        placeholder.style.display = 'none';
        isDetecting = true;
        startDetection();
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
      alert('Could not access webcam. Please grant camera permissions.');
    }
  }

  // Start detection loop
  function startDetection() {
    detectionInterval = setInterval(() => {
      if (isDetecting) {
        // Simplified detection - in production, use TensorFlow.js with YOLO
        detectPhoneUsage();
      }
    }, 2000);
  }

  // Detect phone usage (simplified - would use YOLO model in production)
  function detectPhoneUsage() {
    // This is a placeholder - real implementation would use TensorFlow.js
    // For now, randomly simulate detection for demo purposes
    const isFocused = Math.random() > 0.3; // 70% focused
    updateStatus(isFocused);
  }

  // Update status indicator
  function updateStatus(isFocused) {
    const indicator = panel.querySelector('#status-indicator');
    if (!indicator) return;

    if (isFocused) {
      indicator.style.background = '#10B981';
      indicator.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span style="font-size: 16px; font-weight: 600; color: white;">Focused</span>
      `;
    } else {
      indicator.style.background = '#EF4444';
      indicator.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <span style="font-size: 16px; font-weight: 600; color: white;">Phone Detected!</span>
      `;
    }
  }

  // Attach event listeners
  function attachEventListeners() {
    // Close button - turn off toggle
    panel.querySelector('#close-focus-panel').addEventListener('click', () => {
      stopDetection();
      panel.remove();
      // Turn off the toggle in popup
      browserAPI.storage.sync.get(['toggles'], (result) => {
        const toggles = result.toggles || {};
        toggles.focusDetection = false;
        browserAPI.storage.sync.set({ toggles });
      });
    });

    // Close button hover
    const closeBtn = panel.querySelector('#close-focus-panel');
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.background = 'rgba(239, 68, 68, 0.1)';
      closeBtn.style.color = '#EF4444';
    });
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.background = 'transparent';
      closeBtn.style.color = '#9CA3AF';
    });
  }

  // Stop detection
  function stopDetection() {
    isDetecting = false;
    if (detectionInterval) clearInterval(detectionInterval);
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      videoStream = null;
    }
    
    // Notify background to stop
    browserAPI.runtime.sendMessage({ action: 'stopDetection' });
  }

  // Make panel draggable
  function makeDraggable() {
    const header = panel.querySelector('#focus-header');
    let isDragging = false;
    let startX, startY, startLeft, startTop;

    header.addEventListener('mousedown', (e) => {
      if (e.target.id === 'close-focus-panel' || e.target.closest('#close-focus-panel')) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = panel.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      header.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      panel.style.left = (startLeft + dx) + 'px';
      panel.style.top = (startTop + dy) + 'px';
      panel.style.right = 'auto';
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        header.style.cursor = 'move';
      }
    });
  }

  // Make panel resizable
  function makeResizable() {
    const handle = panel.querySelector('#resize-handle-focus');
    let isResizing = false;
    let startX, startY, startWidth, startHeight;

    handle.addEventListener('mousedown', (e) => {
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = panel.offsetWidth;
      startHeight = panel.offsetHeight;
      e.preventDefault();
      e.stopPropagation();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      panel.style.width = Math.max(350, startWidth + dx) + 'px';
      panel.style.height = Math.max(450, startHeight + dy) + 'px';
    });

    document.addEventListener('mouseup', () => {
      isResizing = false;
    });
  }

  // Initialize
  createPanel();

  // Notify background to start detection
  browserAPI.runtime.sendMessage({ action: 'startDetection' });

  return {
    cleanup: () => {
      stopDetection();
      if (panel) panel.remove();
    }
  };
}


// ========== passive-watching.js ==========
// Nuclear Mode - Website blocker with whitelist and timer
function initPassiveWatching() {
  const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

  // Check if cleanup was just done (prevents re-initialization after toggle OFF)
  try {
    const cleanupDone = sessionStorage.getItem('nuclearModeCleanupDone');
    if (cleanupDone === 'true') {
      console.log('⚠️ Nuclear Mode: Cleanup was just done, skipping initialization');
      sessionStorage.removeItem('nuclearModeCleanupDone');
      return { cleanup: () => { } }; // Return empty cleanup function
    }
  } catch (e) {
    console.log('⚠️ Could not check sessionStorage:', e);
  }

  console.log('🚀 Nuclear Mode: Starting initialization...');

  // CRITICAL: Listen for toggle being turned OFF directly from sync storage
  browserAPI.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.passiveWatching) {
      const newValue = changes.passiveWatching.newValue;
      const oldValue = changes.passiveWatching.oldValue;

      console.log('🔄 passiveWatching changed:', oldValue, '->', newValue);

      if (oldValue === true && newValue === false) {
        console.log('🛑 TOGGLE TURNED OFF - FORCE CLEARING STORAGE');

        // FORCE clear storage immediately
        browserAPI.storage.local.set({
          nuclearMode: {
            whitelist: [],
            timerEndTime: null,
            isActive: false
          }
        }, () => {
          console.log('✅ Storage cleared! Reloading in 500ms...');
          sessionStorage.setItem('nuclearModeCleanupDone', 'true');
          setTimeout(() => {
            window.location.reload();
          }, 500);
        });
      }
    }
  });

  // Variables for Nuclear Mode state
  let panel = null;
  let whitelist = [];
  let timerEndTime = null;
  let timerInterval = null;
  let isActive = false;
  let isContextValid = true;
  let floatingTimer = null;

  // Normalize URL by removing 'www.' from the beginning
  function normalizeURL(url) {
    return url.replace(/^www\./i, "");
  }

  // Check if the current website should be blocked
  function shouldBlockWebsite(whitelistSet) {
    const currentHostname = normalizeURL(window.location.hostname);
    console.log('🔍 Checking if should block:', currentHostname);
    console.log('🔍 Whitelist:', whitelistSet);

    // Check if current site is in whitelist
    const isWhitelisted = whitelistSet.some(site => {
      const normalizedSite = normalizeURL(site);
      const matches = currentHostname === normalizedSite || currentHostname.includes(normalizedSite);
      console.log(`  Comparing ${currentHostname} with ${normalizedSite}: ${matches}`);
      return matches;
    });

    console.log('🔍 Is whitelisted:', isWhitelisted);
    return !isWhitelisted; // Block if NOT whitelisted
  }

  // Create the blocked page (EXACT same approach as reference)
  function createBlockedPage(endTime, wl) {
    console.log('🔒 BLOCKING PAGE NOW!');
    const blockedPage = generateBlockedPageHTML(endTime, wl);
    const style = generateBlockedPageStyle();

    // Inject the styles and blocked page into the current document
    const head = document.head || document.getElementsByTagName("head")[0];
    head.insertAdjacentHTML("beforeend", style);
    document.body.innerHTML = blockedPage;

    // Update timer every second
    setInterval(() => {
      const remaining = Math.ceil((endTime - Date.now()) / 1000 / 60);
      const timerEl = document.getElementById('block-timer-value');
      if (timerEl) {
        if (remaining > 0) {
          timerEl.textContent = `${remaining} min`;
        } else {
          timerEl.textContent = 'Done!';
          window.location.reload();
        }
      }
    }, 1000);
  }

  // Check if the website should be blocked and take appropriate action
  function check_if_restricted(nuclearMode) {
    console.log('🔍 check_if_restricted called');
    console.log('🔍 Nuclear Mode data:', nuclearMode);

    if (!nuclearMode || !nuclearMode.isActive || !nuclearMode.timerEndTime) {
      console.log('❌ Nuclear Mode not active or no timer');
      return false;
    }

    // Check if timer hasn't expired
    if (Date.now() >= nuclearMode.timerEndTime) {
      console.log('❌ Timer expired');
      return false;
    }

    const whitelistSet = nuclearMode.whitelist || [];

    if (shouldBlockWebsite(whitelistSet)) {
      console.log('🔒 SHOULD BLOCK - Creating blocked page');
      createBlockedPage(nuclearMode.timerEndTime, whitelistSet);
      return true;
    }

    console.log('✅ Site is whitelisted - allowing access');
    return false;
  }

  // ============================================
  // IMMEDIATE BLOCKING CHECK (EXACT same as reference site blocker)
  // ============================================

  // Retrieve Nuclear Mode data from storage and block if needed
  browserAPI.storage.local.get("nuclearMode", function (data) {
    console.log('📦 Storage data retrieved:', data);
    const nuclearMode = data.nuclearMode || null;

    if (nuclearMode && nuclearMode.isActive && nuclearMode.timerEndTime) {
      console.log('✅ Nuclear Mode is active with timer');

      // Check if timer hasn't expired
      if (Date.now() < nuclearMode.timerEndTime) {
        console.log('✅ Timer is still valid');

        // Call check function (EXACT same pattern as reference)
        const wasBlocked = check_if_restricted(nuclearMode);

        if (wasBlocked) {
          console.log('🔒 Page was blocked - stopping here');
          return; // Stop here, don't initialize panel
        }

        // Site is whitelisted, show floating timer
        console.log('✅ Site whitelisted - showing floating timer');
        whitelist = nuclearMode.whitelist || [];
        timerEndTime = nuclearMode.timerEndTime;
        isActive = true;

        // Create floating timer on whitelisted sites
        setTimeout(() => {
          createFloatingTimer();
          startTimer();
        }, 1000);
      } else {
        console.log('❌ Timer expired');
      }
    } else {
      console.log('❌ Nuclear Mode not active or no data');
    }

    // Continue with normal initialization (panel creation)
    initializePanel();
  });

  function generateBlockedPageStyle() {
    return `
      <style>
        * {
          user-select: none !important;
          pointer-events: none !important;
          margin: 0 !important;
          padding: 0 !important;
          box-sizing: border-box !important;
        }

        body {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          height: 100vh !important;
          background: linear-gradient(135deg, #1F2937 0%, #111827 100%) !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
          overflow: hidden !important;
        }

        #nuclear-block-container {
          display: block !important;
          color: #fff !important;
          text-align: center !important;
          max-width: 600px !important;
          padding: 40px !important;
          pointer-events: auto !important;
        }

        .block-icon {
          font-size: 96px !important;
          margin-bottom: 32px !important;
          animation: pulse 2s infinite !important;
        }

        .block-title {
          font-size: 48px !important;
          font-weight: 700 !important;
          color: #F9FAFB !important;
          margin: 0 0 24px 0 !important;
        }

        .block-subtitle {
          font-size: 20px !important;
          color: #9CA3AF !important;
          margin-bottom: 40px !important;
          line-height: 1.6 !important;
        }

        .timer-box {
          background: rgba(239, 68, 68, 0.1) !important;
          border: 2px solid #EF4444 !important;
          padding: 32px !important;
          border-radius: 20px !important;
          margin-bottom: 32px !important;
        }

        .timer-label {
          font-size: 14px !important;
          color: #FCA5A5 !important;
          margin-bottom: 16px !important;
          text-transform: uppercase !important;
          letter-spacing: 2px !important;
          font-weight: 700 !important;
        }

        .timer-value {
          font-size: 72px !important;
          font-weight: 700 !important;
          color: #EF4444 !important;
          font-family: 'Courier New', monospace !important;
        }

        .whitelist-box {
          background: rgba(255,255,255,0.05) !important;
          border: 1px solid #374151 !important;
          border-radius: 16px !important;
          padding: 24px !important;
          margin-bottom: 24px !important;
        }

        .whitelist-title {
          font-size: 16px !important;
          color: #D1D5DB !important;
          margin-bottom: 16px !important;
          font-weight: 600 !important;
        }

        .whitelist-item {
          font-size: 15px !important;
          color: #9CA3AF !important;
          line-height: 2 !important;
          padding: 8px 0 !important;
        }

        .warning-box {
          background: rgba(239, 68, 68, 0.1) !important;
          border: 1px solid #EF4444 !important;
          border-radius: 12px !important;
          padding: 20px !important;
          margin-bottom: 24px !important;
        }

        .warning-text {
          font-size: 16px !important;
          color: #FCA5A5 !important;
          margin: 0 !important;
          font-weight: 600 !important;
        }

        .footer-text {
          font-size: 14px !important;
          color: #6B7280 !important;
        }

        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 1;
          }
          50% { 
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
      </style>
    `;
  }

  function generateBlockedPageHTML(endTime, wl) {
    const timeLeft = Math.ceil((endTime - Date.now()) / 1000 / 60);
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nuclear Mode - Site Blocked</title>
      </head>
      <body>
        <div id="nuclear-block-container">
          <div class="block-icon">🔒</div>
          <h1 class="block-title">Nuclear Mode Active</h1>
          <p class="block-subtitle">
            This website is blocked. You can only access whitelisted sites during your focus session.
          </p>
          
          <div class="timer-box">
            <div class="timer-label">Time Remaining</div>
            <div id="block-timer-value" class="timer-value">${timeLeft} min</div>
          </div>

          <div class="whitelist-box">
            <div class="whitelist-title">✓ Whitelisted Sites</div>
            ${wl.map(site => `<div class="whitelist-item">• ${site}</div>`).join('')}
          </div>

          <div class="warning-box">
            <p class="warning-text">⚠️ Timer cannot be stopped. Stay focused!</p>
          </div>

          <p class="footer-text">
            Navigate to a whitelisted site to continue working.
          </p>
        </div>
      </body>
      </html>
    `;
  }

  // ============================================
  // PANEL INITIALIZATION (Your existing UI - unchanged)
  // ============================================

  function initializePanel() {
    // Check if extension context is valid
    function checkContext() {
      try {
        if (!browserAPI.runtime?.id) {
          isContextValid = false;
          cleanup();
          return false;
        }
        return true;
      } catch (e) {
        isContextValid = false;
        cleanup();
        return false;
      }
    }

    // Safe storage get
    function safeStorageGet(keys) {
      return new Promise((resolve) => {
        if (!checkContext()) {
          resolve({});
          return;
        }
        try {
          browserAPI.storage.local.get(keys, (result) => {
            if (browserAPI.runtime.lastError) {
              console.error('Storage get error:', browserAPI.runtime.lastError);
              resolve({});
            } else {
              resolve(result);
            }
          });
        } catch (e) {
          console.error('Storage get exception:', e);
          resolve({});
        }
      });
    }

    // Safe storage set
    function safeStorageSet(data) {
      return new Promise((resolve) => {
        if (!checkContext()) {
          resolve(false);
          return;
        }
        try {
          browserAPI.storage.local.set(data, () => {
            if (browserAPI.runtime.lastError) {
              console.error('Storage set error:', browserAPI.runtime.lastError);
              resolve(false);
            } else {
              resolve(true);
            }
          });
        } catch (e) {
          console.error('Storage set exception:', e);
          resolve(false);
        }
      });
    }

    // Safe message send
    function safeSendMessage(message) {
      return new Promise((resolve) => {
        if (!checkContext()) {
          resolve(false);
          return;
        }
        try {
          browserAPI.runtime.sendMessage(message, (response) => {
            if (browserAPI.runtime.lastError) {
              console.error('Message send error:', browserAPI.runtime.lastError);
              resolve(false);
            } else {
              resolve(true);
            }
          });
        } catch (e) {
          console.error('Message send exception:', e);
          resolve(false);
        }
      });
    }

    // Load saved settings (for panel updates)
    safeStorageGet(['nuclearMode']).then((result) => {
      if (!checkContext()) return;

      if (result.nuclearMode) {
        whitelist = result.nuclearMode.whitelist || [];
        timerEndTime = result.nuclearMode.timerEndTime || null;
        isActive = result.nuclearMode.isActive || false;

        console.log('Loaded from storage - isActive:', isActive, 'timerEndTime:', timerEndTime, 'whitelist:', whitelist);

        // Update the UI with the loaded whitelist
        if (panel) {
          updateWhitelistDisplay();
        }

        if (isActive && timerEndTime) {
          // Check if timer expired
          if (Date.now() > timerEndTime) {
            deactivateNuclearMode();
            return;
          }

          // Block immediately if needed
          checkAndBlockSite();

          // Show floating timer on ALL tabs (whitelisted or not)
          if (!floatingTimer) {
            createFloatingTimer();
          }
          startTimer();
        }
      }
    });

    // Listen for updates from other tabs
    browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (!checkContext()) return;

      if (message.type === 'NUCLEAR_MODE_UPDATED') {
        whitelist = message.data.whitelist || [];
        timerEndTime = message.data.timerEndTime || null;
        isActive = message.data.isActive || false;

        if (isActive && timerEndTime) {
          // Check if current site is whitelisted FIRST
          const currentDomain = window.location.hostname.replace(/^www\./, '');
          const isWhitelisted = whitelist.some(site => {
            const cleanSite = site.replace(/^https?:\/\//, '').replace(/^www\./, '');
            return currentDomain.includes(cleanSite) || cleanSite.includes(currentDomain);
          });

          if (isWhitelisted) {
            // Site is whitelisted - show floating timer
            console.log('✅ This tab is whitelisted - showing floating timer');
            if (!floatingTimer) {
              createFloatingTimer();
            }
            if (!timerInterval) {
              startTimer();
            }
          } else {
            // Site is NOT whitelisted - block it
            console.log('🔒 This tab is NOT whitelisted - will be blocked');
            checkAndBlockSite();
          }
        } else if (isActive === false && message.data.timerEndTime) {
          // Timer was set but not activated yet - just update the values
          console.log('Timer updated but not activated yet');
        } else if (!isActive) {
          // Nuclear mode was deactivated
          deactivateNuclearMode();
        }
      }
    });

    // Save settings and notify other tabs
    async function saveSettings() {
      if (!checkContext()) return;

      console.log('=== saveSettings called ===');
      const data = {
        whitelist,
        timerEndTime,
        isActive
      };
      console.log('Saving data:', JSON.stringify(data));

      const saved = await safeStorageSet({ nuclearMode: data });
      if (saved) {
        console.log('Data saved to storage');
      } else {
        console.error('Failed to save data');
      }

      // Notify background to update all tabs
      const sent = await safeSendMessage({
        type: 'NUCLEAR_MODE_UPDATE',
        data: data
      });

      if (sent) {
        console.log('Notified background of update');
      } else {
        console.error('Failed to notify background');
      }
    }

    // Check if current site is blocked
    function checkAndBlockSite() {
      console.log('=== checkAndBlockSite called ===');
      console.log('isActive:', isActive);
      console.log('timerEndTime:', timerEndTime);

      if (!checkContext()) return;
      if (!isActive || !timerEndTime) {
        console.log('Not active or no timer, skipping block check');
        return;
      }

      const now = Date.now();
      if (now > timerEndTime) {
        // Timer expired
        console.log('Timer expired, deactivating');
        deactivateNuclearMode();
        return;
      }

      const currentDomain = window.location.hostname;
      console.log('Current domain:', currentDomain);
      console.log('Whitelist:', JSON.stringify(whitelist));

      const isWhitelisted = whitelist.some(site => {
        const cleanSite = site.replace(/^https?:\/\//, '').replace(/^www\./, '');
        const cleanCurrent = currentDomain.replace(/^www\./, '');
        const matches = cleanCurrent.includes(cleanSite) || cleanSite.includes(cleanCurrent);
        console.log(`Checking ${cleanSite} against ${cleanCurrent}: ${matches}`);
        return matches;
      });

      console.log('Is whitelisted:', isWhitelisted);

      if (!isWhitelisted) {
        console.log('BLOCKING SITE!');
        blockSiteCompletely();
      } else {
        console.log('Site is whitelisted, allowing access');
      }

      // Add warning before closing browser/tab
      enableCloseWarning();
    }

    // Completely block the site (inspired by reference site blocker)
    function blockSiteCompletely() {
      if (!checkContext()) return;

      console.log('blockSiteCompletely called - clearing page');

      // Stop page loading
      try {
        window.stop();
      } catch (e) {
        console.log('Could not stop page loading:', e);
      }

      // Remove all content from HTML
      const html = document.querySelector("html");
      if (!html) {
        console.error('HTML element not found!');
        return;
      }

      html.innerHTML = "";

      // Add custom CSS
      const style = document.createElement("style");
      style.innerHTML = `
      @import url("https://fonts.googleapis.com/css?family=Aboreto");
      @import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.9.1/font/bootstrap-icons.css");

      * {
        user-select: none !important;
        pointer-events: none !important;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      html {
        background: linear-gradient(135deg, #1F2937 0%, #111827 100%) !important;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      body {
        width: 100%;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      #nuclear-block-container {
        display: block !important;
        color: #fff;
        text-align: center;
        max-width: 600px;
        padding: 40px;
        z-index: 999999999999;
        pointer-events: auto !important;
      }

      .block-icon {
        font-size: 96px;
        margin-bottom: 32px;
        animation: pulse 2s infinite;
      }

      .block-title {
        font-size: 48px;
        font-weight: 700;
        color: #F9FAFB;
        margin: 0 0 24px 0;
      }

      .block-subtitle {
        font-size: 20px;
        color: #9CA3AF;
        margin-bottom: 40px;
        line-height: 1.6;
      }

      .timer-box {
        background: rgba(239, 68, 68, 0.1);
        border: 2px solid #EF4444;
        padding: 32px;
        border-radius: 20px;
        margin-bottom: 32px;
      }

      .timer-label {
        font-size: 14px;
        color: #FCA5A5;
        margin-bottom: 16px;
        text-transform: uppercase;
        letter-spacing: 2px;
        font-weight: 700;
      }

      .timer-value {
        font-size: 72px;
        font-weight: 700;
        color: #EF4444;
        font-family: 'Courier New', monospace;
      }

      .whitelist-box {
        background: rgba(255,255,255,0.05);
        border: 1px solid #374151;
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 24px;
      }

      .whitelist-title {
        font-size: 16px;
        color: #D1D5DB;
        margin-bottom: 16px;
        font-weight: 600;
      }

      .whitelist-item {
        font-size: 15px;
        color: #9CA3AF;
        line-height: 2;
        padding: 8px 0;
      }

      .warning-box {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid #EF4444;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 24px;
      }

      .warning-text {
        font-size: 16px;
        color: #FCA5A5;
        margin: 0;
        font-weight: 600;
      }

      .footer-text {
        font-size: 14px;
        color: #6B7280;
      }

      @keyframes pulse {
        0%, 100% { 
          transform: scale(1);
          opacity: 1;
        }
        50% { 
          transform: scale(1.1);
          opacity: 0.8;
        }
      }
    `;
      html.appendChild(style);

      // Create block container
      const timeLeft = Math.ceil((timerEndTime - Date.now()) / 1000 / 60);
      const container = document.createElement("div");
      container.id = "nuclear-block-container";
      container.innerHTML = `
      <div class="block-icon">🔒</div>
      <h1 class="block-title">Nuclear Mode Active</h1>
      <p class="block-subtitle">
        This website is blocked. You can only access whitelisted sites during your focus session.
      </p>
      
      <div class="timer-box">
        <div class="timer-label">Time Remaining</div>
        <div id="block-timer-value" class="timer-value">${timeLeft} min</div>
      </div>

      <div class="whitelist-box">
        <div class="whitelist-title">✓ Whitelisted Sites</div>
        ${whitelist.map(site => `<div class="whitelist-item">• ${site}</div>`).join('')}
      </div>

      <div class="warning-box">
        <p class="warning-text">⚠️ Timer cannot be stopped. Stay focused!</p>
      </div>

      <p class="footer-text">
        Navigate to a whitelisted site to continue working.
      </p>
    `;

      html.appendChild(container);

      console.log('Block screen created and displayed');

      // Update timer every second
      const updateTimer = setInterval(() => {
        if (!checkContext()) {
          clearInterval(updateTimer);
          return;
        }

        const remaining = Math.ceil((timerEndTime - Date.now()) / 1000 / 60);
        const timerEl = document.getElementById('block-timer-value');
        if (timerEl) {
          if (remaining > 0) {
            timerEl.textContent = `${remaining} min`;
          } else {
            timerEl.textContent = 'Done!';
            clearInterval(updateTimer);
            // Reload to deactivate
            window.location.reload();
          }
        }
      }, 1000);

      // Prevent all escape attempts
      document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }, true);

      document.addEventListener('keydown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }, true);

      // Prevent navigation
      window.addEventListener('beforeunload', (e) => {
        e.preventDefault();
        e.returnValue = '';
        return '';
      });
    }

    // Prevent closing browser/tab with warning
    function enableCloseWarning() {
      if (!checkContext()) return;
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    function disableCloseWarning() {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    }

    function handleBeforeUnload(e) {
      if (!checkContext()) return;
      if (!isActive || !timerEndTime) return;

      const timeLeft = Math.ceil((timerEndTime - Date.now()) / 1000 / 60);
      if (timeLeft > 0) {
        const message = `Nuclear Mode is active! ${timeLeft} minutes remaining. Are you sure you want to quit?`;
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    }





    // Create control panel
    function createPanel() {
      panel = document.createElement('div');
      panel.id = 'nuclear-mode-panel';
      panel.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 480px; min-height: 400px; background: linear-gradient(135deg, #1F2937 0%, #111827 100%);
      border-radius: 16px; border: 1px solid #374151; box-shadow: 0 20px 60px rgba(0,0,0,0.6);
      z-index: 9999999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #E5E7EB; overflow: hidden; display: flex; flex-direction: column;
      resize: both; min-width: 400px; min-height: 350px;
    `;

      const currentDomain = window.location.hostname.replace(/^www\./, '');

      panel.innerHTML = `
      <div id="panel-header" style="background: linear-gradient(135deg, #374151 0%, #1F2937 100%); padding: 16px 20px; cursor: move; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #374151; user-select: none;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: #F9FAFB;">Nuclear Mode</h2>
        </div>
        <button id="close-panel" style="background: transparent; border: none; color: #9CA3AF; cursor: pointer; font-size: 24px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 6px; transition: all 0.2s;">×</button>
      </div>

      <div style="padding: 20px; flex: 1; overflow-y: auto;">
        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 14px; font-weight: 600; color: #D1D5DB; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">Whitelist</h3>
          <div style="display: flex; gap: 8px; margin-bottom: 12px;">
            <input type="text" id="whitelist-input" placeholder="example.com" style="flex: 1; background: rgba(255,255,255,0.05); border: 1px solid #374151; border-radius: 8px; padding: 10px 14px; color: #E5E7EB; font-size: 14px; outline: none;">
            <button id="add-whitelist" style="background: #3B82F6; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.2s;">Add</button>
          </div>
          <button id="add-current-site" style="width: 100%; background: rgba(59, 130, 246, 0.1); color: #60A5FA; border: 1px solid #3B82F6; padding: 10px; border-radius: 8px; cursor: pointer; font-size: 13px; margin-bottom: 12px; transition: all 0.2s;">
            Add Current Site (${currentDomain})
          </button>
          <div id="whitelist-container" style="display: flex; flex-direction: column; gap: 8px; max-height: 200px; overflow-y: auto;">
            ${whitelist.length === 0 ? '<div style="text-align: center; padding: 20px; color: #6B7280; font-size: 14px;">No whitelisted sites yet</div>' : ''}
          </div>
        </div>

        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 14px; font-weight: 600; color: #D1D5DB; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">Timer</h3>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 12px;">
            <button class="timer-preset" data-minutes="15" style="background: rgba(255,255,255,0.05); border: 1px solid #374151; color: #E5E7EB; padding: 12px; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.2s;">15m</button>
            <button class="timer-preset" data-minutes="30" style="background: rgba(255,255,255,0.05); border: 1px solid #374151; color: #E5E7EB; padding: 12px; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.2s;">30m</button>
            <button class="timer-preset" data-minutes="60" style="background: rgba(255,255,255,0.05); border: 1px solid #374151; color: #E5E7EB; padding: 12px; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.2s;">1h</button>
            <button class="timer-preset" data-minutes="120" style="background: rgba(255,255,255,0.05); border: 1px solid #374151; color: #E5E7EB; padding: 12px; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.2s;">2h</button>
          </div>
          <div style="display: flex; gap: 8px;">
            <input type="number" id="custom-minutes" placeholder="Custom minutes" min="1" max="480" style="flex: 1; background: rgba(255,255,255,0.05); border: 1px solid #374151; border-radius: 8px; padding: 10px 14px; color: #E5E7EB; font-size: 14px; outline: none;">
            <button id="set-custom-timer" style="background: rgba(255,255,255,0.05); border: 1px solid #374151; color: #E5E7EB; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.2s;">Set</button>
          </div>
        </div>

        <button id="activate-nuclear" style="width: 100%; background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; border: none; padding: 14px; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4); transition: all 0.2s;">
          Activate Nuclear Mode
        </button>

        <button id="deactivate-nuclear" style="width: 100%; background: rgba(255,255,255,0.05); color: #9CA3AF; border: 1px solid #374151; padding: 14px; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; margin-top: 12px; display: none; transition: all 0.2s;">
          Stop Nuclear Mode
        </button>
      </div>

      <div id="resize-handle" style="position: absolute; bottom: 0; right: 0; width: 20px; height: 20px; cursor: nwse-resize; background: linear-gradient(135deg, transparent 50%, #374151 50%); border-radius: 0 0 16px 0;"></div>
    `;

      document.body.appendChild(panel);
      updateWhitelistDisplay();
      attachEventListeners();
      makeDraggable();
      makeResizable();

      if (isActive && timerEndTime) {
        showActiveState();
      }
    }

    // Update whitelist display
    function updateWhitelistDisplay() {
      console.log('=== updateWhitelistDisplay called ===');
      console.log('Current whitelist:', JSON.stringify(whitelist));

      const container = document.querySelector('#nuclear-mode-panel #whitelist-container');

      if (!container) {
        console.error('Whitelist container not found');
        return;
      }

      console.log('Container found');

      if (whitelist.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: #6B7280; font-size: 14px;">No whitelisted sites yet</div>';
        console.log('Showing empty state');
        return;
      }

      container.innerHTML = whitelist.map((site, index) => `
      <div class="whitelist-item" style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.05); border: 1px solid #374151; border-radius: 8px; padding: 10px 14px; transition: all 0.2s;">
        <span style="color: #E5E7EB; font-size: 14px;">${site}</span>
        <button class="remove-whitelist" data-index="${index}" style="background: rgba(239, 68, 68, 0.1); color: #EF4444; border: none; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 12px; transition: all 0.2s;">Remove</button>
      </div>
    `).join('');

      console.log('Whitelist HTML updated with', whitelist.length, 'items');

      // Add remove handlers
      const removeButtons = container.querySelectorAll('.remove-whitelist');
      console.log('Found', removeButtons.length, 'remove buttons');

      removeButtons.forEach(btn => {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();

          const index = parseInt(this.dataset.index);
          console.log('=== Remove clicked for index:', index, '===');
          console.log('Site to remove:', whitelist[index]);
          console.log('Whitelist before remove:', JSON.stringify(whitelist));

          if (index >= 0 && index < whitelist.length) {
            whitelist.splice(index, 1);
            console.log('Whitelist after remove:', JSON.stringify(whitelist));
            saveSettings();
            updateWhitelistDisplay();
          } else {
            console.error('Invalid index:', index);
          }
        });

        btn.addEventListener('mouseenter', function () {
          this.style.background = '#EF4444';
          this.style.color = 'white';
        });

        btn.addEventListener('mouseleave', function () {
          this.style.background = 'rgba(239, 68, 68, 0.1)';
          this.style.color = '#EF4444';
        });
      });

      console.log('Remove handlers attached to all buttons');
    }

    // Attach event listeners
    function attachEventListeners() {
      if (!panel) {
        console.error('Panel not found in attachEventListeners');
        return;
      }

      if (!checkContext()) {
        console.error('Extension context invalid');
        return;
      }

      console.log('attachEventListeners called');

      // Close button
      const closeBtn = panel.querySelector('#close-panel');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          panel.remove();
          if (checkContext()) {
            safeStorageSet({ passiveWatching: false });
          }
        });

        closeBtn.addEventListener('mouseenter', function () {
          this.style.background = 'rgba(239, 68, 68, 0.1)';
          this.style.color = '#EF4444';
        });
        closeBtn.addEventListener('mouseleave', function () {
          this.style.background = 'transparent';
          this.style.color = '#9CA3AF';
        });
      }

      // Add whitelist function
      const addWhitelist = () => {
        if (!checkContext()) {
          console.log('Extension context invalid');
          return;
        }

        console.log('=== Add whitelist clicked ===');
        const input = document.querySelector('#nuclear-mode-panel #whitelist-input');

        if (!input) {
          console.error('Input element not found');
          return;
        }

        const rawValue = input.value.trim();
        console.log('Raw input value:', rawValue);

        if (!rawValue) {
          console.log('Empty input');
          alert('Please enter a website domain (e.g., google.com)');
          return;
        }

        // Clean the site URL
        let site = rawValue
          .replace(/^https?:\/\//, '')  // Remove protocol
          .replace(/^www\./, '')         // Remove www
          .replace(/\/.*$/, '');         // Remove path

        console.log('Cleaned site:', site);
        console.log('Current whitelist:', JSON.stringify(whitelist));

        if (whitelist.includes(site)) {
          console.log('Site already in whitelist');
          alert('This site is already in the whitelist!');
          return;
        }

        // Add to whitelist
        whitelist.push(site);
        console.log('Added to whitelist. New whitelist:', JSON.stringify(whitelist));

        // Save and update
        saveSettings();
        updateWhitelistDisplay();
        input.value = '';

        console.log('Whitelist add complete');
      };

      // Add button click
      const addBtn = panel.querySelector('#add-whitelist');
      if (addBtn) {
        console.log('Add button found, attaching listener');
        addBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          addWhitelist();
        });
      } else {
        console.error('Add button not found');
      }

      // Input enter key
      const whitelistInput = panel.querySelector('#whitelist-input');
      if (whitelistInput) {
        console.log('Input found, attaching keypress listener');
        whitelistInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            console.log('Enter key pressed');
            addWhitelist();
          }
        });
      } else {
        console.error('Whitelist input not found');
      }

      // Add current site button
      const addCurrentBtn = panel.querySelector('#add-current-site');
      if (addCurrentBtn) {
        console.log('Add current site button found');
        addCurrentBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();

          if (!checkContext()) {
            alert('Extension context invalid. Please reload the page.');
            return;
          }

          console.log('=== Add current site clicked ===');

          const currentDomain = window.location.hostname.replace(/^www\./, '');
          console.log('Current domain:', currentDomain);
          console.log('Current whitelist:', JSON.stringify(whitelist));

          if (whitelist.includes(currentDomain)) {
            console.log('Current site already in whitelist');
            alert('This site is already in the whitelist!');
            return;
          }

          whitelist.push(currentDomain);
          console.log('Added current site. New whitelist:', JSON.stringify(whitelist));

          saveSettings();
          updateWhitelistDisplay();

          console.log('Add current site complete');
        });
      } else {
        console.error('Add current site button not found');
      }

      // Timer presets
      const timerPresets = panel.querySelectorAll('.timer-preset');
      console.log('Timer preset buttons found:', timerPresets.length);
      timerPresets.forEach(btn => {
        btn.addEventListener('click', function () {
          const minutes = parseInt(this.dataset.minutes);
          console.log('Timer preset clicked:', minutes, 'minutes');
          setTimer(minutes);
        });
        btn.addEventListener('mouseenter', function () {
          this.style.background = '#3B82F6';
          this.style.borderColor = '#3B82F6';
        });
        btn.addEventListener('mouseleave', function () {
          this.style.background = 'rgba(255,255,255,0.05)';
          this.style.borderColor = '#374151';
        });
      });

      // Custom timer
      const setCustomBtn = panel.querySelector('#set-custom-timer');
      if (setCustomBtn) {
        setCustomBtn.addEventListener('click', () => {
          const customInput = panel.querySelector('#custom-minutes');
          const minutes = parseInt(customInput.value);
          console.log('Custom timer set:', minutes, 'minutes');
          if (minutes > 0) {
            setTimer(minutes);
          } else {
            alert('Please enter a valid number of minutes');
          }
        });
      }

      // Activate nuclear mode
      const activateBtn = panel.querySelector('#activate-nuclear');
      if (activateBtn) {
        activateBtn.addEventListener('click', activateNuclearMode);
      }

      const deactivateBtn = panel.querySelector('#deactivate-nuclear');
      if (deactivateBtn) {
        deactivateBtn.addEventListener('click', deactivateNuclearMode);
      }

      console.log('All event listeners attached');
    }

    // Set timer
    async function setTimer(minutes) {
      console.log('=== setTimer called ===');
      console.log('Setting timer for', minutes, 'minutes');
      timerEndTime = Date.now() + (minutes * 60 * 1000);
      console.log('timerEndTime set to:', timerEndTime);
      console.log('Timer will end at:', new Date(timerEndTime).toLocaleTimeString());

      await saveSettings();
      console.log('Settings saved after timer set');

      // Show visual feedback
      alert(`✓ Timer set for ${minutes} minutes! Click "Activate Nuclear Mode" to start.`);
    }

    // Start timer countdown
    function startTimer() {
      if (!checkContext()) return;
      if (timerInterval) clearInterval(timerInterval);

      timerInterval = setInterval(() => {
        if (!checkContext()) {
          clearInterval(timerInterval);
          return;
        }

        updateFloatingTimer();

        if (Date.now() >= timerEndTime) {
          clearInterval(timerInterval);
          deactivateNuclearMode();
        }
      }, 1000);
    }

    // Activate nuclear mode
    async function activateNuclearMode() {
      console.log('=== activateNuclearMode called ===');
      console.log('Whitelist length:', whitelist.length);
      console.log('timerEndTime:', timerEndTime);

      if (whitelist.length === 0) {
        alert('⚠️ Please add at least one website to the whitelist!');
        return;
      }
      if (!timerEndTime) {
        alert('⚠️ Please set a timer first!');
        return;
      }

      // Set active FIRST before saving
      isActive = true;

      // Save settings to storage
      await saveSettings();

      console.log('✅ Nuclear Mode activated!');
      console.log('Whitelist:', whitelist);
      console.log('Timer ends at:', new Date(timerEndTime).toLocaleTimeString());

      // Show success message
      alert(`🔒 Nuclear Mode Activated!\n\nTimer: ${Math.ceil((timerEndTime - Date.now()) / 60000)} minutes\n\nOnly whitelisted sites are accessible.\nAll other sites will be blocked.`);

      // Close main panel
      if (panel) panel.remove();

      // Check current site and block immediately if needed
      const currentDomain = window.location.hostname.replace(/^www\./, '');
      const isCurrentWhitelisted = whitelist.some(site => {
        const cleanSite = site.replace(/^https?:\/\//, '').replace(/^www\./, '');
        return currentDomain.includes(cleanSite) || cleanSite.includes(currentDomain);
      });

      if (!isCurrentWhitelisted) {
        // Current site is NOT whitelisted - block it immediately
        console.log('🔒 Current site is NOT whitelisted - blocking now');
        blockSiteCompletely();
      } else {
        // Current site IS whitelisted - show floating timer
        console.log('✅ Current site is whitelisted - showing timer');
        createFloatingTimer();
        startTimer();
        enableCloseWarning();
      }
    }

    // Create floating timer window
    let floatingTimer = null;
    function createFloatingTimer() {
      if (!checkContext()) return;

      // Remove existing timer if any
      if (floatingTimer && floatingTimer.parentNode) {
        floatingTimer.remove();
      }

      floatingTimer = document.createElement('div');
      floatingTimer.id = 'nuclear-floating-timer';
      floatingTimer.style.cssText = `
      position: fixed; top: 20px; right: 20px; width: 200px; min-height: 100px;
      background: linear-gradient(135deg, #1F2937 0%, #111827 100%);
      border-radius: 12px; border: 2px solid #EF4444;
      box-shadow: 0 8px 32px rgba(239, 68, 68, 0.6); z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #E5E7EB; padding: 16px; resize: both; overflow: hidden;
      min-width: 180px; min-height: 90px;
    `;

      floatingTimer.innerHTML = `
      <div id="timer-header" style="cursor: move; user-select: none; margin-bottom: 12px;">
        <div style="font-size: 12px; color: #EF4444; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">🔒 NUCLEAR MODE</div>
      </div>
      <div style="text-align: center;">
        <div id="floating-timer-value" style="font-size: 48px; font-weight: 700; color: #EF4444; line-height: 1;">--:--</div>
        <div style="font-size: 11px; color: #9CA3AF; margin-top: 8px;">Time Remaining</div>
      </div>
      <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #374151;">
        <div style="font-size: 10px; color: #6B7280; text-align: center;">Cannot be stopped</div>
      </div>
    `;

      document.body.appendChild(floatingTimer);
      updateFloatingTimer();
      makeFloatingTimerDraggable();

      console.log('Floating timer created on:', window.location.hostname);
    }

    // Update floating timer display
    function updateFloatingTimer() {
      if (!checkContext()) return;
      if (!floatingTimer) return;

      const value = floatingTimer.querySelector('#floating-timer-value');
      if (!value) return;

      const remaining = Math.max(0, timerEndTime - Date.now());
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      value.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      // Pulse effect when time is running low (< 5 minutes)
      if (minutes < 5 && remaining > 0) {
        floatingTimer.style.animation = 'pulse 2s infinite';
      }
    }

    // Make floating timer draggable
    function makeFloatingTimerDraggable() {
      const header = floatingTimer.querySelector('#timer-header');
      let isDragging = false;
      let startX, startY, startLeft, startTop;

      header.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = floatingTimer.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;
        header.style.cursor = 'grabbing';
      });

      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        floatingTimer.style.left = (startLeft + dx) + 'px';
        floatingTimer.style.top = (startTop + dy) + 'px';
        floatingTimer.style.right = 'auto';
      });

      document.addEventListener('mouseup', () => {
        if (isDragging) {
          isDragging = false;
          header.style.cursor = 'move';
        }
      });
    }

    // Deactivate nuclear mode
    async function deactivateNuclearMode() {
      console.log('=== deactivateNuclearMode called ===');
      isActive = false;
      timerEndTime = null;
      if (timerInterval) clearInterval(timerInterval);
      disableCloseWarning();

      // Save with isActive: false to stop blocking
      await saveSettings();

      // Turn off the toggle in sync storage
      await browserAPI.storage.sync.set({ passiveWatching: false });

      console.log('✅ Nuclear Mode deactivated - storage cleared');

      if (panel) {
        const activateBtn = panel.querySelector('#activate-nuclear');
        const deactivateBtn = panel.querySelector('#deactivate-nuclear');
        if (activateBtn) activateBtn.style.display = 'block';
        if (deactivateBtn) deactivateBtn.style.display = 'none';
      }

      // Remove floating timer
      if (floatingTimer) floatingTimer.remove();

      // Remove block overlay if exists
      const blockOverlay = document.getElementById('nuclear-mode-block');
      if (blockOverlay) blockOverlay.remove();

      // Remove block container if exists
      const blockContainer = document.getElementById('nuclear-block-container');
      if (blockContainer) blockContainer.remove();

      // Deactivation successful - page will just reload
      console.log('✅ Nuclear Mode deactivated! Page will reload.');

      // Reload current page after a brief delay
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }

    // Show active state
    function showActiveState() {
      if (panel) {
        panel.querySelector('#activate-nuclear').style.display = 'none';
        panel.querySelector('#deactivate-nuclear').style.display = 'block';
      }
    }

    // Make panel draggable
    function makeDraggable() {
      const header = panel.querySelector('#panel-header');
      let isDragging = false;
      let startX, startY, startLeft, startTop;

      header.addEventListener('mousedown', (e) => {
        if (e.target.id === 'close-panel' || e.target.closest('#close-panel')) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = panel.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;
        panel.style.transform = 'none';
        header.style.cursor = 'grabbing';
      });

      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        panel.style.left = (startLeft + dx) + 'px';
        panel.style.top = (startTop + dy) + 'px';
      });

      document.addEventListener('mouseup', () => {
        if (isDragging) {
          isDragging = false;
          header.style.cursor = 'move';
        }
      });
    }

    // Make panel resizable
    function makeResizable() {
      const handle = panel.querySelector('#resize-handle');
      let isResizing = false;
      let startX, startY, startWidth, startHeight;

      handle.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = panel.offsetWidth;
        startHeight = panel.offsetHeight;
        e.preventDefault();
        e.stopPropagation();
      });

      document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        panel.style.width = Math.max(400, startWidth + dx) + 'px';
        panel.style.height = Math.max(350, startHeight + dy) + 'px';
      });

      document.addEventListener('mouseup', () => {
        isResizing = false;
      });
    }

    // Initialize
    console.log('Nuclear Mode initializing...');

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
    @keyframes pulse {
      0%, 100% { 
        box-shadow: 0 8px 32px rgba(239, 68, 68, 0.6);
        border-color: #EF4444;
      }
      50% { 
        box-shadow: 0 8px 48px rgba(239, 68, 68, 1);
        border-color: #DC2626;
      }
    }
    
    #nuclear-floating-timer {
      pointer-events: auto !important;
    }
    
    #nuclear-mode-panel {
      pointer-events: auto !important;
    }
  `;
    document.head.appendChild(style);

    createPanel();
    console.log('Nuclear Mode panel created');

    // Cleanup function - FORCEFULLY stop Nuclear Mode (called when toggle is turned OFF)
    function cleanup() {
      console.log('🛑🛑🛑 NUCLEAR MODE CLEANUP CALLED - TOGGLE TURNED OFF 🛑🛑🛑');

      // Set a flag in sessionStorage to prevent infinite reload loop
      try {
        sessionStorage.setItem('nuclearModeCleanupDone', 'true');
        console.log('✅ Set cleanup flag in sessionStorage');
      } catch (e) {
        console.log('⚠️ Could not set sessionStorage flag:', e);
      }

      // FORCE set isActive to false
      isActive = false;
      timerEndTime = null;

      // Clear Nuclear Mode from storage IMMEDIATELY
      const clearData = {
        nuclearMode: {
          whitelist: [],
          timerEndTime: null,
          isActive: false
        }
      };

      console.log('🛑 Setting storage to:', clearData);

      browserAPI.storage.local.set(clearData, () => {
        console.log('✅ Nuclear Mode storage CLEARED - isActive = false');

        // Verify it was cleared
        browserAPI.storage.local.get('nuclearMode', (result) => {
          console.log('🔍 Verification - Storage after clear:', result);
        });
      });

      // Clean up UI elements
      console.log('🧹 Cleaning up UI elements...');
      if (panel && panel.parentNode) {
        panel.remove();
        console.log('✅ Panel removed');
      }
      if (floatingTimer && floatingTimer.parentNode) {
        floatingTimer.remove();
        console.log('✅ Floating timer removed');
      }
      if (timerInterval) {
        clearInterval(timerInterval);
        console.log('✅ Timer interval cleared');
      }
      disableCloseWarning();

      const blockContainer = document.getElementById('nuclear-block-container');
      if (blockContainer) {
        blockContainer.remove();
        console.log('✅ Block container removed');
      }
      if (style && style.parentNode) {
        style.remove();
        console.log('✅ Styles removed');
      }

      isContextValid = false;

      // Notify background to update all tabs
      browserAPI.runtime.sendMessage({
        type: 'NUCLEAR_MODE_UPDATE',
        data: {
          whitelist: [],
          timerEndTime: null,
          isActive: false
        }
      }, () => {
        console.log('✅ Background notified of deactivation');
      });

      // RELOAD page to unblock (with delay to ensure storage is cleared)
      console.log('🔄 RELOADING PAGE in 500ms to unblock...');
      setTimeout(() => {
        console.log('🔄 RELOADING NOW!');
        window.location.reload();
      }, 500);
    }

    return {
      cleanup: cleanup
    };
  } // End of initializePanel()
}


// ========== energy-scheduling.js ==========
function initEnergyScheduling() {
  const panel = document.createElement('div');
  panel.id = 'energy-scheduling-panel';
  panel.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 280px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  `;

  panel.innerHTML = `
    <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 12px; font-weight: 600; border-radius: 8px 8px 0 0;">
      ⚡ Energy Level
      <button id="close-energy-panel" style="float: right; background: none; border: none; color: white; cursor: pointer; font-size: 18px;">×</button>
    </div>
    <div style="padding: 16px;">
      <div style="margin-bottom: 12px; font-size: 13px; color: #6b7280;">How's your energy?</div>
      <div style="display: flex; gap: 8px; margin-bottom: 16px;">
        <button class="energy-btn" data-level="high" style="flex: 1; padding: 8px; border: 2px solid #10b981; background: white; border-radius: 6px; cursor: pointer; font-size: 12px;">
          🔥 High
        </button>
        <button class="energy-btn" data-level="low" style="flex: 1; padding: 8px; border: 2px solid #f59e0b; background: white; border-radius: 6px; cursor: pointer; font-size: 12px;">
          😴 Low
        </button>
      </div>
      <div id="energy-suggestion" style="font-size: 12px; color: #374151; padding: 12px; background: #f3f4f6; border-radius: 6px; display: none;"></div>
    </div>
  `;

  document.body.appendChild(panel);

  const suggestions = {
    high: '💪 Great! Focus on complex tasks, coding, or problem-solving.',
    low: '🧘 Take it easy. Review docs, organize tasks, or take a break.'
  };

  document.querySelectorAll('.energy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const level = e.target.dataset.level;
      const suggestionEl = document.getElementById('energy-suggestion');
      suggestionEl.textContent = suggestions[level];
      suggestionEl.style.display = 'block';
      
      // Highlight selected button
      document.querySelectorAll('.energy-btn').forEach(b => {
        b.style.background = 'white';
      });
      e.target.style.background = level === 'high' ? '#d1fae5' : '#fef3c7';
    });
  });

  document.getElementById('close-energy-panel').addEventListener('click', () => {
    panel.remove();
  });

  return {
    cleanup: () => panel.remove()
  };
}


// ========== speed-improver.js ==========
// Video Speed Control - Advanced playback speed controller
function initSpeedImprover() {
  const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
  
  let panel = null;
  let currentSpeed = 1;
  let video = null;
  let videoCheckInterval = null;

  // Dragging state
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let panelStartX = 0;
  let panelStartY = 0;

  // Resizing state
  let isResizing = false;
  let resizeStartX = 0;
  let resizeStartY = 0;
  let panelStartWidth = 0;
  let panelStartHeight = 0;

  // Slider dragging
  let isSliderDragging = false;

  // Find video element
  function findVideo() {
    const videos = document.querySelectorAll('video');
    if (videos.length > 0) {
      // Prefer the largest video (main content)
      let largestVideo = videos[0];
      let maxArea = 0;
      
      videos.forEach(v => {
        const area = v.offsetWidth * v.offsetHeight;
        if (area > maxArea) {
          maxArea = area;
          largestVideo = v;
        }
      });
      
      return largestVideo;
    }
    return null;
  }

  // Create panel
  panel = document.createElement('div');
  panel.id = 'speed-control-panel';
  panel.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    width: 320px;
    min-width: 280px;
    min-height: 180px;
    background: linear-gradient(135deg, #2D3748 0%, #1A202C 100%);
    border-radius: 12px;
    border: 1px solid #4A5568;
    box-shadow: 0 20px 60px rgba(0,0,0,0.6);
    z-index: 9999998;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color: #E5E7EB;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 14px;
  `;

  panel.innerHTML = `
    <div id="speed-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; cursor: move; user-select: none; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <div style="font-weight: 600; font-size: 14px; color: #E5E7EB;">Video Speed Control</div>
      </div>
      <div style="display: flex; align-items: center; gap: 6px;">
        <button id="reset-speed-btn" title="Reset to 1x" style="background: rgba(255,255,255,0.1); border: none; color: #9CA3AF; cursor: pointer; font-size: 14px; padding: 0; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border-radius: 5px; transition: all 0.2s;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M3 21v-5h5"/>
          </svg>
        </button>
        <button id="help-speed-btn" title="Help" style="background: rgba(255,255,255,0.1); border: none; color: #9CA3AF; cursor: pointer; font-size: 13px; padding: 0; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border-radius: 5px; transition: all 0.2s;">?</button>
        <button id="close-speed-panel" style="background: rgba(255,255,255,0.1); border: none; color: #9CA3AF; cursor: pointer; font-size: 18px; padding: 0; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border-radius: 5px; transition: all 0.2s;">×</button>
      </div>
    </div>

    <!-- Speed Slider -->
    <div style="margin-bottom: 16px;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
        <button id="decrease-speed-btn" style="width: 36px; height: 36px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #E5E7EB; font-size: 18px; font-weight: 300; transition: all 0.2s; flex-shrink: 0;">−</button>
        
        <div style="flex: 1; position: relative;">
          <input type="range" id="speed-slider" min="0.25" max="16" step="0.25" value="1" style="width: 100%; height: 6px; background: linear-gradient(to right, #3B82F6 0%, #3B82F6 6.25%, #4B5563 6.25%, #4B5563 100%); border-radius: 3px; outline: none; -webkit-appearance: none; cursor: pointer;">
          <style>
            #speed-slider::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 16px;
              height: 16px;
              background: #60A5FA;
              border: 2px solid #1E293B;
              border-radius: 50%;
              cursor: grab;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            }
            #speed-slider::-webkit-slider-thumb:active {
              cursor: grabbing;
              transform: scale(1.1);
            }
            #speed-slider::-moz-range-thumb {
              width: 16px;
              height: 16px;
              background: #60A5FA;
              border: 2px solid #1E293B;
              border-radius: 50%;
              cursor: grab;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            }
          </style>
        </div>
        
        <button id="increase-speed-btn" style="width: 36px; height: 36px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #E5E7EB; font-size: 18px; font-weight: 300; transition: all 0.2s; flex-shrink: 0;">+</button>
      </div>
    </div>

    <!-- Current Speed Display -->
    <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 12px; margin-bottom: 14px;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.3px;">Current playback rate</div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="font-size: 10px; color: #6B7280;">×</div>
          <input type="number" id="speed-input" min="0.25" max="16" step="0.25" value="1" style="width: 60px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #E5E7EB; padding: 6px 8px; border-radius: 6px; font-size: 14px; font-weight: 600; text-align: center; outline: none;">
          <button id="apply-speed-btn" style="background: linear-gradient(135deg, #3B82F6, #2563EB); color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 600; transition: all 0.2s; display: flex; align-items: center; gap: 4px;">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Apply
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Presets -->
    <div style="margin-bottom: 12px;">
      <div style="font-size: 10px; color: #9CA3AF; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.3px;">Quick Presets</div>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
        <button class="preset-btn" data-speed="0.5" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); color: #E5E7EB; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 500; transition: all 0.2s;">0.5×</button>
        <button class="preset-btn" data-speed="1" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); color: #E5E7EB; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 500; transition: all 0.2s;">1×</button>
        <button class="preset-btn" data-speed="1.5" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); color: #E5E7EB; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 500; transition: all 0.2s;">1.5×</button>
        <button class="preset-btn" data-speed="2" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); color: #E5E7EB; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 500; transition: all 0.2s;">2×</button>
        <button class="preset-btn" data-speed="2.5" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); color: #E5E7EB; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 500; transition: all 0.2s;">2.5×</button>
        <button class="preset-btn" data-speed="3" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); color: #E5E7EB; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 500; transition: all 0.2s;">3×</button>
        <button class="preset-btn" data-speed="4" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); color: #E5E7EB; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 500; transition: all 0.2s;">4×</button>
        <button class="preset-btn" data-speed="8" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); color: #E5E7EB; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 500; transition: all 0.2s;">8×</button>
      </div>
    </div>

    <!-- Video Status -->
    <div id="video-status" style="font-size: 9px; color: #6B7280; text-align: center; padding: 6px; background: rgba(255,255,255,0.03); border-radius: 5px;">
      Searching for video...
    </div>
  `;

  document.body.appendChild(panel);

  // Add resize handle
  const resizeHandle = document.createElement('div');
  resizeHandle.id = 'resize-handle-speed';
  resizeHandle.style.cssText = `
    position: absolute;
    bottom: 0;
    right: 0;
    width: 20px;
    height: 20px;
    cursor: nwse-resize;
    background: linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.1) 50%);
    border-radius: 0 0 16px 0;
    z-index: 10;
  `;
  panel.appendChild(resizeHandle);

  // Find and monitor video
  function updateVideo() {
    video = findVideo();
    const statusEl = document.getElementById('video-status');
    
    if (video) {
      statusEl.textContent = `Video found: ${video.videoWidth}×${video.videoHeight}`;
      statusEl.style.color = '#10B981';
      
      // Apply current speed
      video.playbackRate = currentSpeed;
      
      // Listen for speed changes from native controls
      video.addEventListener('ratechange', () => {
        if (Math.abs(video.playbackRate - currentSpeed) > 0.01) {
          currentSpeed = video.playbackRate;
          updateUI();
        }
      });
    } else {
      statusEl.textContent = 'No video found on page';
      statusEl.style.color = '#EF4444';
    }
  }

  // Update UI elements
  function updateUI() {
    document.getElementById('speed-slider').value = currentSpeed;
    document.getElementById('speed-input').value = currentSpeed;
    
    // Update slider background
    const slider = document.getElementById('speed-slider');
    const percentage = ((currentSpeed - 0.25) / (16 - 0.25)) * 100;
    slider.style.background = `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${percentage}%, #4B5563 ${percentage}%, #4B5563 100%)`;
  }

  // Set speed
  function setSpeed(speed) {
    speed = Math.max(0.25, Math.min(16, speed));
    currentSpeed = speed;
    
    if (video) {
      video.playbackRate = speed;
    }
    
    updateUI();
  }

  // Check for video periodically
  videoCheckInterval = setInterval(updateVideo, 1000);
  updateVideo();

  // Event Listeners

  // Slider
  const slider = document.getElementById('speed-slider');
  slider.addEventListener('input', (e) => {
    setSpeed(parseFloat(e.target.value));
  });

  // Decrease button
  document.getElementById('decrease-speed-btn').addEventListener('click', () => {
    setSpeed(currentSpeed - 0.25);
  });

  // Increase button
  document.getElementById('increase-speed-btn').addEventListener('click', () => {
    setSpeed(currentSpeed + 0.25);
  });

  // Input field
  const speedInput = document.getElementById('speed-input');
  speedInput.addEventListener('change', (e) => {
    setSpeed(parseFloat(e.target.value) || 1);
  });

  // Apply button
  document.getElementById('apply-speed-btn').addEventListener('click', () => {
    const speed = parseFloat(speedInput.value) || 1;
    setSpeed(speed);
  });

  // Preset buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const speed = parseFloat(btn.dataset.speed);
      setSpeed(speed);
    });

    // Hover effect
    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'rgba(59, 130, 246, 0.2)';
      btn.style.borderColor = '#3B82F6';
      btn.style.transform = 'translateY(-2px)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'rgba(255,255,255,0.08)';
      btn.style.borderColor = 'rgba(255,255,255,0.12)';
      btn.style.transform = 'translateY(0)';
    });
  });

  // Reset button
  document.getElementById('reset-speed-btn').addEventListener('click', () => {
    setSpeed(1);
  });

  // Help button
  document.getElementById('help-speed-btn').addEventListener('click', () => {
    alert('Video Speed Control\n\n' +
          '• Use slider or +/- buttons to adjust speed\n' +
          '• Range: 0.25× to 16× (YouTube limit is 2×)\n' +
          '• Click preset buttons for quick speeds\n' +
          '• Enter custom speed in the input field\n' +
          '• Works on YouTube, Vimeo, and most video sites\n\n' +
          'Keyboard shortcuts:\n' +
          '• Use native video controls for fine-tuning');
  });

  // Make panel draggable
  const header = document.getElementById('speed-header');
  
  header.addEventListener('mousedown', (e) => {
    if (e.target.closest('button')) return;
    
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    
    const rect = panel.getBoundingClientRect();
    panelStartX = rect.left;
    panelStartY = rect.top;
    
    panel.style.right = 'auto';
    panel.style.left = panelStartX + 'px';
    panel.style.top = panelStartY + 'px';
    
    header.style.cursor = 'grabbing';
    e.preventDefault();
  });

  // Make panel resizable
  resizeHandle.addEventListener('mousedown', (e) => {
    isResizing = true;
    resizeStartX = e.clientX;
    resizeStartY = e.clientY;
    
    panelStartWidth = panel.offsetWidth;
    panelStartHeight = panel.offsetHeight;
    
    e.preventDefault();
    e.stopPropagation();
  });

  // Mouse move handler
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStartX;
      const deltaY = e.clientY - dragStartY;
      
      let newX = panelStartX + deltaX;
      let newY = panelStartY + deltaY;
      
      const maxX = window.innerWidth - panel.offsetWidth;
      const maxY = window.innerHeight - panel.offsetHeight;
      
      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));
      
      panel.style.left = newX + 'px';
      panel.style.top = newY + 'px';
    }
    
    if (isResizing) {
      const deltaX = e.clientX - resizeStartX;
      const deltaY = e.clientY - resizeStartY;
      
      let newWidth = panelStartWidth + deltaX;
      let newHeight = panelStartHeight + deltaY;
      
      newWidth = Math.max(280, Math.min(newWidth, window.innerWidth * 0.9));
      newHeight = Math.max(180, Math.min(newHeight, window.innerHeight * 0.9));
      
      panel.style.width = newWidth + 'px';
      panel.style.height = newHeight + 'px';
    }
  });

  // Mouse up handler
  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      header.style.cursor = 'move';
    }
    if (isResizing) {
      isResizing = false;
    }
  });

  // Close panel
  document.getElementById('close-speed-panel').addEventListener('click', () => {
    panel.remove();
    clearInterval(videoCheckInterval);
    browserAPI.storage.sync.set({ speedImprover: false });
  });

  // Hover effects for header buttons
  const headerButtons = [
    'reset-speed-btn',
    'help-speed-btn',
    'close-speed-panel'
  ];

  headerButtons.forEach(id => {
    const btn = document.getElementById(id);
    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'rgba(255,255,255,0.2)';
      btn.style.color = '#fff';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'rgba(255,255,255,0.1)';
      btn.style.color = '#9CA3AF';
    });
  });

  // Hover effects for +/- buttons
  ['decrease-speed-btn', 'increase-speed-btn'].forEach(id => {
    const btn = document.getElementById(id);
    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'rgba(59, 130, 246, 0.2)';
      btn.style.borderColor = '#3B82F6';
      btn.style.transform = 'scale(1.05)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'rgba(255,255,255,0.08)';
      btn.style.borderColor = 'rgba(255,255,255,0.15)';
      btn.style.transform = 'scale(1)';
    });
  });

  // Hover effect for apply button
  const applyBtn = document.getElementById('apply-speed-btn');
  applyBtn.addEventListener('mouseenter', () => {
    applyBtn.style.transform = 'scale(1.05)';
    applyBtn.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
  });
  applyBtn.addEventListener('mouseleave', () => {
    applyBtn.style.transform = 'scale(1)';
    applyBtn.style.boxShadow = 'none';
  });

  console.log('Video Speed Control initialized');

  return {
    cleanup: () => {
      panel.remove();
      clearInterval(videoCheckInterval);
      if (video) {
        video.playbackRate = 1;
      }
      console.log('Video Speed Control disabled');
    }
  };
}


// ========== youtube-adblock.js ==========
// YouTube Ad Blocker - Content Script
function initYouTubeAdBlock() {
  if (!window.location.hostname.includes('youtube.com')) {
    return { cleanup: () => {} };
  }

  console.log('YouTube Ad Blocker initialized');

  // CSS to hide ad elements
  const style = document.createElement('style');
  style.id = 'youtube-adblock-style';
  style.textContent = `
    /* Hide video ads */
    .video-ads,
    .ytp-ad-module,
    .ytp-ad-overlay-container,
    .ytp-ad-text-overlay,
    .ytp-ad-player-overlay,
    .ytp-ad-image-overlay,
    ytd-display-ad-renderer,
    ytd-promoted-sparkles-web-renderer,
    ytd-promoted-video-renderer,
    ytd-compact-promoted-video-renderer,
    ytd-promoted-sparkles-text-search-renderer,
    
    /* Hide banner ads */
    #masthead-ad,
    ytd-banner-promo-renderer,
    ytd-statement-banner-renderer,
    
    /* Hide sidebar ads */
    ytd-ad-slot-renderer,
    ytd-in-feed-ad-layout-renderer,
    yt-mealbar-promo-renderer,
    
    /* Hide overlay ads */
    .ytp-ad-overlay-container,
    .ytp-ad-overlay-image,
    .ytp-ad-text-overlay,
    
    /* Hide companion ads */
    #player-ads,
    #watch-channel-brand-div,
    
    /* Hide shorts ads */
    ytd-reel-video-renderer[is-ad],
    
    /* Hide search ads */
    ytd-search-pyv-renderer,
    
    /* Hide homepage ads */
    ytd-rich-item-renderer[is-ad],
    
    /* Additional ad containers */
    .ytd-display-ad-renderer,
    .ytd-promoted-sparkles-web-renderer,
    .ytd-video-masthead-ad-v3-renderer,
    .ytd-statement-banner-renderer,
    .ytd-primetime-promo-renderer {
      display: none !important;
      visibility: hidden !important;
      height: 0 !important;
      min-height: 0 !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
    
    /* Speed up video when ad is detected */
    .ad-showing video {
      playback-rate: 16 !important;
    }
  `;
  document.head.appendChild(style);

  // Function to skip video ads
  function skipAds() {
    try {
      // Skip button
      const skipButton = document.querySelector('.ytp-ad-skip-button, .ytp-skip-ad-button, .ytp-ad-skip-button-modern');
      if (skipButton) {
        skipButton.click();
        console.log('Clicked skip button');
      }

      // Close overlay ads
      const closeButtons = document.querySelectorAll('.ytp-ad-overlay-close-button, .ytp-ad-overlay-close-container');
      closeButtons.forEach(btn => btn.click());

      // Speed up ads if they can't be skipped
      const video = document.querySelector('video');
      const adContainer = document.querySelector('.ad-showing, .ad-interrupting');
      
      if (video && adContainer) {
        video.playbackRate = 16;
        video.muted = true;
        console.log('Speeding up ad');
      }

      // Remove ad elements from DOM
      const adElements = document.querySelectorAll(`
        ytd-display-ad-renderer,
        ytd-promoted-sparkles-web-renderer,
        ytd-ad-slot-renderer,
        ytd-in-feed-ad-layout-renderer,
        .video-ads,
        .ytp-ad-module,
        ytd-banner-promo-renderer,
        ytd-statement-banner-renderer,
        #player-ads
      `);
      
      adElements.forEach(el => {
        if (el && el.parentNode) {
          el.remove();
          console.log('Removed ad element:', el.tagName);
        }
      });

      // Check if video is playing an ad and try to skip
      if (video) {
        const adIndicator = document.querySelector('.ytp-ad-text, .ytp-ad-preview-text');
        if (adIndicator) {
          // Try to seek to end of ad
          const duration = video.duration;
          if (duration && duration > 0 && duration < 60) {
            video.currentTime = duration - 0.1;
            console.log('Skipped to end of ad');
          }
        }
      }

    } catch (error) {
      console.error('Error in skipAds:', error);
    }
  }

  // Run immediately
  skipAds();

  // Run periodically
  const interval = setInterval(skipAds, 500);

  // Observer for dynamic content
  const observer = new MutationObserver((mutations) => {
    skipAds();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Listen for video events
  document.addEventListener('yt-navigate-finish', skipAds);
  document.addEventListener('yt-page-data-updated', skipAds);

  // Intercept ad requests
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    if (typeof url === 'string') {
      // Block ad-related requests
      if (url.includes('/api/stats/ads') || 
          url.includes('/pagead/') || 
          url.includes('/ptracking') ||
          url.includes('doubleclick.net') ||
          url.includes('googlesyndication.com')) {
        console.log('Blocked ad request:', url);
        return Promise.reject(new Error('Ad blocked'));
      }
    }
    return originalFetch.apply(this, args);
  };

  // Intercept XMLHttpRequest
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    if (typeof url === 'string') {
      if (url.includes('/api/stats/ads') || 
          url.includes('/pagead/') || 
          url.includes('/ptracking') ||
          url.includes('doubleclick.net') ||
          url.includes('googlesyndication.com')) {
        console.log('Blocked XHR ad request:', url);
        return;
      }
    }
    return originalOpen.call(this, method, url, ...rest);
  };

  console.log('YouTube ad blocking active');

  return {
    cleanup: () => {
      clearInterval(interval);
      observer.disconnect();
      style.remove();
      document.removeEventListener('yt-navigate-finish', skipAds);
      document.removeEventListener('yt-page-data-updated', skipAds);
      window.fetch = originalFetch;
      XMLHttpRequest.prototype.open = originalOpen;
      console.log('YouTube ad blocking disabled');
    }
  };
}


// ========== github-navigation.js ==========
// GitHub Navigation Feature - Uses Shepherd.js for guided navigation
let tour = null;
let shepherdLoaded = false;

// Dynamically load Shepherd.js
async function loadShepherd() {
  if (shepherdLoaded) return;
  
  try {
    // Load Shepherd CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/shepherd.js@13.0.0/dist/css/shepherd.css';
    document.head.appendChild(link);
    
    // Load Shepherd JS
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/shepherd.js@13.0.0/dist/js/shepherd.min.js';
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    
    shepherdLoaded = true;
  } catch (error) {
    console.error('Failed to load Shepherd.js:', error);
  }
}

function initGitHubNavigation() {
  // Load Shepherd.js when feature is enabled
  loadShepherd();
  
  // Listen for navigation requests from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'checkNavigation') {
      handleNavigation(request.query, request.answer, request.pageContent);
    }
  });

  return {
    cleanup: () => {
      if (tour) {
        tour.complete();
        tour = null;
      }
    }
  };
}

function handleNavigation(query, answer, pageContent) {
  const lowerQuery = query.toLowerCase();
  const lowerAnswer = answer.toLowerCase();
  
  try {
    const content = JSON.parse(pageContent);
    
    // Extract potential folder/file names from the query
    const words = lowerQuery.split(/\s+/);
    
    // Check if user is asking about a specific directory or file
    for (const word of words) {
      const directoryMatch = content.directoryListing.find(item => 
        item.name.toLowerCase() === word || 
        item.name.toLowerCase().includes(word) ||
        word.includes(item.name.toLowerCase())
      );
      
      if (directoryMatch) {
        navigateToItem(directoryMatch);
        return;
      }
    }
    
    // Also check in the answer
    const answerWords = lowerAnswer.split(/\s+/);
    for (const word of answerWords) {
      const directoryMatch = content.directoryListing.find(item => 
        item.name.toLowerCase() === word || 
        item.name.toLowerCase().includes(word)
      );
      
      if (directoryMatch) {
        navigateToItem(directoryMatch);
        return;
      }
    }
    
    // Check for common navigation patterns
    if (lowerQuery.includes('readme')) {
      const readmeElement = document.querySelector('#readme');
      if (readmeElement) {
        readmeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        highlightElement(readmeElement);
      }
    }
    
    if (lowerQuery.includes('issues')) {
      const issuesTab = document.querySelector('[data-tab-item="issues-tab"]');
      if (issuesTab) {
        createTour([{
          element: issuesTab,
          title: 'Issues Tab',
          text: 'Click here to view repository issues'
        }]);
      }
    }
    
    if (lowerQuery.includes('pull request') || lowerQuery.includes('pr')) {
      const prTab = document.querySelector('[data-tab-item="pull-requests-tab"]');
      if (prTab) {
        createTour([{
          element: prTab,
          title: 'Pull Requests',
          text: 'Click here to view pull requests'
        }]);
      }
    }
    
  } catch (error) {
    console.error('Navigation error:', error);
  }
}

function navigateToItem(item) {
  // Find the row containing the item
  const fileRows = document.querySelectorAll('[role="row"]');
  let targetElement = null;
  
  for (const row of fileRows) {
    const link = row.querySelector('a[href]');
    if (link && (
      link.getAttribute('href') === item.href || 
      link.textContent.trim() === item.name ||
      link.getAttribute('href').includes(item.name)
    )) {
      targetElement = link;
      break;
    }
  }
  
  // Fallback: search all links
  if (!targetElement) {
    const links = document.querySelectorAll('a[href]');
    for (const link of links) {
      const linkText = link.textContent.trim();
      const linkHref = link.getAttribute('href');
      if (linkText === item.name || linkHref === item.href || linkHref.includes(`/${item.name}`)) {
        targetElement = link;
        break;
      }
    }
  }
  
  if (targetElement) {
    // Scroll to element first
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Wait a bit for scroll, then show tour
    setTimeout(() => {
      createTour([{
        element: targetElement,
        title: `Navigate to ${item.name}`,
        text: `Click here to open the "${item.name}" folder/file`,
        buttons: [
          {
            text: 'Open',
            action: () => {
              targetElement.click();
              if (tour) tour.complete();
            }
          },
          {
            text: 'Cancel',
            action: () => {
              if (tour) tour.cancel();
            }
          }
        ]
      }]);
    }, 300);
  } else {
    console.log('Could not find element for:', item);
  }
}

function createTour(steps) {
  if (!window.Shepherd) {
    console.error('Shepherd.js not loaded');
    return;
  }
  
  if (tour) {
    tour.complete();
  }
  
  tour = new window.Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      classes: 'github-ai-tour',
      scrollTo: { behavior: 'smooth', block: 'center' },
      cancelIcon: {
        enabled: true
      }
    }
  });
  
  steps.forEach((step, index) => {
    tour.addStep({
      id: `step-${index}`,
      attachTo: {
        element: step.element,
        on: 'bottom'
      },
      title: step.title,
      text: step.text,
      buttons: step.buttons || [
        {
          text: 'Got it',
          action: tour.complete
        }
      ]
    });
  });
  
  tour.start();
}

function highlightElement(element) {
  element.style.transition = 'all 0.3s ease';
  element.style.boxShadow = '0 0 0 3px #1f6feb';
  element.style.borderRadius = '6px';
  
  setTimeout(() => {
    element.style.boxShadow = '';
  }, 2000);
}


// ========== github-chatbot-ui.js ==========
// GitHub Chatbot UI - Floating, collapsible, movable window
function initGitHubChatbotUI() {
  // Add markdown styles
  addMarkdownStyles();
  let chatWindow = null;
  let isCollapsed = false;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let windowStartX = 0;
  let windowStartY = 0;
  let messages = [];
  let apiKey = null;

  // Load API key
  chrome.storage.local.get(['groqApiKey'], (result) => {
    if (result.groqApiKey) {
      apiKey = result.groqApiKey;
      if (chatWindow) {
        updateChatWindow();
      }
    }
  });

  function createChatWindow() {
    if (chatWindow) return;

    chatWindow = document.createElement('div');
    chatWindow.id = 'github-ai-chatbot';
    chatWindow.innerHTML = `
      <div class="chat-header">
        <div class="chat-title">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          <span>GitHub AI Assistant</span>
        </div>
        <div class="chat-controls">
          <button class="chat-btn collapse-btn" title="Collapse">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM5 7.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
            </svg>
          </button>
          <button class="chat-btn close-btn" title="Close">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="chat-body">
        <div class="chat-messages" id="chat-messages-container"></div>
        <div class="chat-input-area">
          <textarea id="chat-input" placeholder="Ask about this repository..." rows="2"></textarea>
          <button id="chat-send-btn" class="send-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="chat-footer">
        <button id="settings-btn" class="settings-btn">⚙️ Settings</button>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      #github-ai-chatbot {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 380px;
        max-height: 600px;
        background: #0d1117;
        border: 1px solid #30363d;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        z-index: 999999;
        display: flex;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #c9d1d9;
        transition: max-height 0.3s ease;
      }

      #github-ai-chatbot.collapsed {
        max-height: 48px;
      }

      .chat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: #161b22;
        border-bottom: 1px solid #30363d;
        border-radius: 12px 12px 0 0;
        cursor: move;
        user-select: none;
      }

      .chat-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 14px;
        color: #58a6ff;
      }

      .chat-controls {
        display: flex;
        gap: 8px;
      }

      .chat-btn {
        background: transparent;
        border: none;
        color: #8b949e;
        cursor: pointer;
        padding: 4px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .chat-btn:hover {
        background: #30363d;
        color: #c9d1d9;
      }

      .chat-body {
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: hidden;
      }

      #github-ai-chatbot.collapsed .chat-body,
      #github-ai-chatbot.collapsed .chat-footer {
        display: none;
      }

      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-height: 400px;
      }

      .chat-messages::-webkit-scrollbar {
        width: 8px;
      }

      .chat-messages::-webkit-scrollbar-track {
        background: #0d1117;
      }

      .chat-messages::-webkit-scrollbar-thumb {
        background: #30363d;
        border-radius: 4px;
      }

      .chat-messages::-webkit-scrollbar-thumb:hover {
        background: #484f58;
      }

      .message {
        padding: 10px 12px;
        border-radius: 8px;
        font-size: 13px;
        line-height: 1.5;
        max-width: 85%;
        word-wrap: break-word;
      }

      .message.user {
        background: #1f6feb;
        color: white;
        align-self: flex-end;
        margin-left: auto;
      }

      .message.assistant {
        background: #21262d;
        color: #c9d1d9;
        align-self: flex-start;
      }

      .message.error {
        background: #da3633;
        color: white;
        align-self: flex-start;
      }

      .message.loading {
        background: #21262d;
        color: #8b949e;
        font-style: italic;
        align-self: flex-start;
      }

      .chat-input-area {
        display: flex;
        gap: 8px;
        padding: 12px 16px;
        border-top: 1px solid #30363d;
        background: #0d1117;
      }

      #chat-input {
        flex: 1;
        background: #0d1117;
        border: 1px solid #30363d;
        border-radius: 6px;
        padding: 8px 12px;
        color: #c9d1d9;
        font-size: 13px;
        font-family: inherit;
        resize: none;
        outline: none;
      }

      #chat-input:focus {
        border-color: #58a6ff;
      }

      .send-btn {
        background: #238636;
        border: none;
        border-radius: 6px;
        padding: 8px 12px;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }

      .send-btn:hover {
        background: #2ea043;
      }

      .send-btn:disabled {
        background: #21262d;
        cursor: not-allowed;
        opacity: 0.5;
      }

      .chat-footer {
        padding: 8px 16px;
        border-top: 1px solid #30363d;
        background: #0d1117;
        border-radius: 0 0 12px 12px;
      }

      .settings-btn {
        background: transparent;
        border: 1px solid #30363d;
        color: #8b949e;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
        width: 100%;
        transition: all 0.2s;
      }

      .settings-btn:hover {
        background: #21262d;
        color: #c9d1d9;
        border-color: #484f58;
      }

      .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: #8b949e;
      }

      .empty-state svg {
        margin-bottom: 12px;
        opacity: 0.5;
      }

      .empty-state p {
        font-size: 13px;
        margin: 8px 0;
      }

      .api-key-setup {
        padding: 20px;
        text-align: center;
      }

      .api-key-setup h3 {
        font-size: 14px;
        margin-bottom: 12px;
        color: #c9d1d9;
      }

      .api-key-setup input {
        width: 100%;
        background: #0d1117;
        border: 1px solid #30363d;
        border-radius: 6px;
        padding: 8px 12px;
        color: #c9d1d9;
        font-size: 13px;
        margin-bottom: 12px;
      }

      .api-key-setup button {
        width: 100%;
        background: #238636;
        border: none;
        border-radius: 6px;
        padding: 8px 16px;
        color: white;
        font-size: 13px;
        cursor: pointer;
        transition: background 0.2s;
      }

      .api-key-setup button:hover {
        background: #2ea043;
      }

      .api-key-setup .info {
        font-size: 11px;
        color: #8b949e;
        margin-top: 12px;
      }

      .api-key-setup .info a {
        color: #58a6ff;
        text-decoration: none;
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(chatWindow);

    // Initialize UI
    updateChatWindow();
    attachEventListeners();
  }

  function updateChatWindow() {
    const messagesContainer = document.getElementById('chat-messages-container');
    if (!messagesContainer) return;

    if (!apiKey) {
      messagesContainer.innerHTML = `
        <div class="api-key-setup">
          <h3>Setup Groq API Key</h3>
          <input type="password" id="api-key-input" placeholder="Enter your Groq API key" />
          <button id="save-api-key-btn">Save API Key</button>
          <p class="info">
            Get your free API key from 
            <a href="https://console.groq.com" target="_blank">console.groq.com</a>
          </p>
        </div>
      `;
      
      const saveBtn = document.getElementById('save-api-key-btn');
      const input = document.getElementById('api-key-input');
      
      saveBtn.onclick = () => {
        const key = input.value.trim();
        if (key) {
          chrome.storage.local.set({ groqApiKey: key }, () => {
            apiKey = key;
            messages = [];
            updateChatWindow();
          });
        }
      };
      
      input.onkeydown = (e) => {
        if (e.key === 'Enter') {
          saveBtn.click();
        }
      };
    } else if (messages.length === 0) {
      messagesContainer.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          <p>Ask me anything about this repository!</p>
          <p style="font-size: 11px; margin-top: 4px;">I can help you understand code, find files, and navigate the repo.</p>
        </div>
      `;
    } else {
      messagesContainer.innerHTML = messages.map(msg => {
        if (msg.type === 'assistant') {
          return `<div class="message ${msg.type}"><div class="markdown-content">${renderMarkdown(msg.text)}</div></div>`;
        } else if (msg.type === 'user') {
          return `<div class="message ${msg.type}">${escapeHtml(msg.text)}</div>`;
        } else {
          return `<div class="message ${msg.type}">${escapeHtml(msg.text)}</div>`;
        }
      }).join('');
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  function attachEventListeners() {
    const header = chatWindow.querySelector('.chat-header');
    const collapseBtn = chatWindow.querySelector('.collapse-btn');
    const closeBtn = chatWindow.querySelector('.close-btn');
    const sendBtn = document.getElementById('chat-send-btn');
    const input = document.getElementById('chat-input');
    const settingsBtn = document.getElementById('settings-btn');

    // Dragging
    header.addEventListener('mousedown', (e) => {
      if (e.target.closest('.chat-btn')) return;
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      const rect = chatWindow.getBoundingClientRect();
      windowStartX = rect.left;
      windowStartY = rect.top;
      chatWindow.style.transition = 'none';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartX;
      const deltaY = e.clientY - dragStartY;
      chatWindow.style.left = (windowStartX + deltaX) + 'px';
      chatWindow.style.top = (windowStartY + deltaY) + 'px';
      chatWindow.style.right = 'auto';
      chatWindow.style.bottom = 'auto';
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        chatWindow.style.transition = '';
      }
    });

    // Collapse
    collapseBtn.addEventListener('click', () => {
      isCollapsed = !isCollapsed;
      chatWindow.classList.toggle('collapsed', isCollapsed);
      collapseBtn.innerHTML = isCollapsed ? 
        `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0zm7-3.25v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.75.75 0 0 1 7 8.25v-3.5a.75.75 0 0 1 1.5 0z"/></svg>` :
        `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM5 7.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/></svg>`;
    });

    // Close
    closeBtn.addEventListener('click', () => {
      cleanup();
    });

    // Send message
    const sendMessage = async () => {
      const query = input.value.trim();
      if (!query || !apiKey) return;

      input.value = '';
      messages.push({ text: query, type: 'user' });
      updateChatWindow();

      messages.push({ text: 'Analyzing...', type: 'loading' });
      updateChatWindow();
      sendBtn.disabled = true;

      try {
        const pageContent = await extractGitHubContent();
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'system',
                content: `You are a helpful assistant analyzing GitHub repository pages. The user is viewing a GitHub page with the following content:\n\n${pageContent}\n\nAnswer questions about the repository, files, issues, or any content visible on the page. Be concise and helpful.`
              },
              {
                role: 'user',
                content: query
              }
            ],
            temperature: 0.7,
            max_tokens: 1024
          })
        });

        messages.pop(); // Remove loading message

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const answer = data.choices[0].message.content;
        messages.push({ text: answer, type: 'assistant' });
        updateChatWindow();

        // Send navigation command
        chrome.runtime.sendMessage({
          action: 'checkNavigation',
          query: query,
          answer: answer,
          pageContent: pageContent
        }).catch(() => {});

      } catch (error) {
        messages.pop(); // Remove loading message
        messages.push({ text: `Error: ${error.message}`, type: 'error' });
        updateChatWindow();
      } finally {
        sendBtn.disabled = false;
      }
    };

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Settings
    settingsBtn.addEventListener('click', () => {
      const changeKey = confirm('Do you want to change your API key?');
      if (changeKey) {
        apiKey = null;
        messages = [];
        chrome.storage.local.remove('groqApiKey');
        updateChatWindow();
      }
    });
  }

  async function extractGitHubContent() {
    const content = {
      url: window.location.href,
      title: document.title,
      repoName: '',
      currentPath: '',
      fileContent: '',
      directoryListing: [],
      issueContent: '',
      readmeContent: ''
    };

    const pathParts = window.location.pathname.split('/').filter(p => p);
    if (pathParts.length >= 2) {
      content.repoName = `${pathParts[0]}/${pathParts[1]}`;
    }

    if (pathParts.length > 3 && pathParts[2] === 'tree') {
      content.currentPath = pathParts.slice(4).join('/');
    } else if (pathParts.length > 3 && pathParts[2] === 'blob') {
      content.currentPath = pathParts.slice(4).join('/');
      
      const rawUrl = window.location.pathname.replace('/blob/', '/raw/');
      try {
        const response = await fetch(rawUrl);
        if (response.ok) {
          const rawContent = await response.text();
          content.fileContent = rawContent.substring(0, 10000);
        }
      } catch (error) {
        const fileContent = document.querySelector('.blob-wrapper');
        if (fileContent) {
          content.fileContent = fileContent.innerText.substring(0, 5000);
        }
      }
    }

    const fileRows = document.querySelectorAll('[role="rowheader"] a, .js-navigation-item a');
    fileRows.forEach(link => {
      const text = link.textContent.trim();
      const href = link.getAttribute('href');
      if (text && href && !text.includes('..')) {
        content.directoryListing.push({ name: text, href: href });
      }
    });

    const readme = document.querySelector('#readme article, .markdown-body');
    if (readme) {
      content.readmeContent = readme.innerText.substring(0, 3000);
    }

    if (window.location.pathname.includes('/issues')) {
      const issueTitle = document.querySelector('.js-issue-title');
      const issueBody = document.querySelector('.comment-body');
      if (issueTitle) content.issueContent += `Title: ${issueTitle.textContent.trim()}\n`;
      if (issueBody) content.issueContent += `Body: ${issueBody.innerText.substring(0, 2000)}`;
    }

    return JSON.stringify(content, null, 2);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function cleanup() {
    if (chatWindow) {
      chatWindow.remove();
      chatWindow = null;
    }
  }

  // Create the window
  createChatWindow();

  return {
    cleanup: cleanup
  };
}


// ========== learning-agent-ui.js ==========
// Learning Agent UI - Universal page content analyzer
function initLearningAgentUI() {
  // Add markdown styles
  addMarkdownStyles();
  let chatWindow = null;
  let isCollapsed = false;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let windowStartX = 0;
  let windowStartY = 0;
  let messages = [];
  let apiKey = null;

  // Load API key
  chrome.storage.local.get(['groqApiKey'], (result) => {
    if (result.groqApiKey) {
      apiKey = result.groqApiKey;
      if (chatWindow) {
        updateChatWindow();
      }
    }
  });

  function createChatWindow() {
    if (chatWindow) return;

    chatWindow = document.createElement('div');
    chatWindow.id = 'learning-agent-chatbot';
    chatWindow.innerHTML = `
      <div class="chat-header">
        <div class="chat-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
          </svg>
          <span>Learning Assistant</span>
        </div>
        <div class="chat-controls">
          <button class="chat-btn collapse-btn" title="Collapse">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM5 7.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
            </svg>
          </button>
          <button class="chat-btn close-btn" title="Close">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="chat-body">
        <div class="chat-messages" id="learning-chat-messages"></div>
        <div class="chat-input-area">
          <textarea id="learning-chat-input" placeholder="Ask about this page..." rows="2"></textarea>
          <button id="learning-chat-send" class="send-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="chat-footer">
        <button id="learning-settings-btn" class="settings-btn">⚙️ Settings</button>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      #learning-agent-chatbot {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 380px;
        max-height: 600px;
        background: #1f2937;
        border: 1px solid #374151;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        z-index: 999999;
        display: flex;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #f3f4f6;
        transition: max-height 0.3s ease;
        overflow: hidden;
      }

      #learning-agent-chatbot.collapsed {
        max-height: 48px;
      }

      #learning-agent-chatbot .chat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: #111827;
        border-bottom: 1px solid #374151;
        cursor: move;
        user-select: none;
      }

      #learning-agent-chatbot .chat-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 14px;
        color: #8b5cf6;
      }

      #learning-agent-chatbot .chat-controls {
        display: flex;
        gap: 8px;
      }

      #learning-agent-chatbot .chat-btn {
        background: transparent;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        padding: 4px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      #learning-agent-chatbot .chat-btn:hover {
        background: #374151;
        color: #f3f4f6;
      }

      #learning-agent-chatbot .chat-body {
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: hidden;
        background: #1f2937;
      }

      #learning-agent-chatbot.collapsed .chat-body,
      #learning-agent-chatbot.collapsed .chat-footer {
        display: none;
      }

      #learning-agent-chatbot .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-height: 400px;
      }

      #learning-agent-chatbot .chat-messages::-webkit-scrollbar {
        width: 8px;
      }

      #learning-agent-chatbot .chat-messages::-webkit-scrollbar-track {
        background: #111827;
      }

      #learning-agent-chatbot .chat-messages::-webkit-scrollbar-thumb {
        background: #374151;
        border-radius: 4px;
      }

      #learning-agent-chatbot .chat-messages::-webkit-scrollbar-thumb:hover {
        background: #4b5563;
      }

      #learning-agent-chatbot .message {
        padding: 10px 14px;
        border-radius: 8px;
        font-size: 13px;
        line-height: 1.5;
        max-width: 85%;
        word-wrap: break-word;
        animation: slideIn 0.3s ease;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      #learning-agent-chatbot .message.user {
        background: #8b5cf6;
        color: white;
        align-self: flex-end;
        margin-left: auto;
      }

      #learning-agent-chatbot .message.assistant {
        background: #374151;
        color: #f3f4f6;
        align-self: flex-start;
      }

      #learning-agent-chatbot .message.error {
        background: #ef4444;
        color: white;
        align-self: flex-start;
      }

      #learning-agent-chatbot .message.loading {
        background: #374151;
        color: #9ca3af;
        font-style: italic;
        align-self: flex-start;
      }

      #learning-agent-chatbot .chat-input-area {
        display: flex;
        gap: 8px;
        padding: 12px 16px;
        border-top: 1px solid #374151;
        background: #1f2937;
      }

      #learning-agent-chatbot #learning-chat-input {
        flex: 1;
        background: #111827;
        border: 1px solid #374151;
        border-radius: 6px;
        padding: 8px 12px;
        color: #f3f4f6;
        font-size: 13px;
        font-family: inherit;
        resize: none;
        outline: none;
        transition: border-color 0.2s;
      }

      #learning-agent-chatbot #learning-chat-input:focus {
        border-color: #8b5cf6;
      }

      #learning-agent-chatbot #learning-chat-input::placeholder {
        color: #6b7280;
      }

      #learning-agent-chatbot .send-btn {
        background: #8b5cf6;
        border: none;
        border-radius: 6px;
        padding: 8px 12px;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }

      #learning-agent-chatbot .send-btn:hover {
        background: #7c3aed;
      }

      #learning-agent-chatbot .send-btn:disabled {
        background: #4b5563;
        cursor: not-allowed;
        opacity: 0.5;
      }

      #learning-agent-chatbot .chat-footer {
        padding: 8px 16px;
        border-top: 1px solid #374151;
        background: #111827;
      }

      #learning-agent-chatbot .settings-btn {
        background: transparent;
        border: 1px solid #374151;
        color: #9ca3af;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
        width: 100%;
        transition: all 0.2s;
      }

      #learning-agent-chatbot .settings-btn:hover {
        background: #374151;
        color: #f3f4f6;
        border-color: #4b5563;
      }

      #learning-agent-chatbot .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: #9ca3af;
      }

      #learning-agent-chatbot .empty-state svg {
        margin-bottom: 12px;
        opacity: 0.5;
      }

      #learning-agent-chatbot .empty-state p {
        font-size: 13px;
        margin: 8px 0;
      }

      #learning-agent-chatbot .api-key-setup {
        padding: 20px;
        text-align: center;
      }

      #learning-agent-chatbot .api-key-setup h3 {
        font-size: 14px;
        margin-bottom: 12px;
        color: #f3f4f6;
      }

      #learning-agent-chatbot .api-key-setup input {
        width: 100%;
        background: #111827;
        border: 1px solid #374151;
        border-radius: 6px;
        padding: 8px 12px;
        color: #f3f4f6;
        font-size: 13px;
        margin-bottom: 12px;
        outline: none;
      }

      #learning-agent-chatbot .api-key-setup input:focus {
        border-color: #8b5cf6;
      }

      #learning-agent-chatbot .api-key-setup input::placeholder {
        color: #6b7280;
      }

      #learning-agent-chatbot .api-key-setup button {
        width: 100%;
        background: #8b5cf6;
        border: none;
        border-radius: 6px;
        padding: 10px 16px;
        color: white;
        font-size: 13px;
        cursor: pointer;
        transition: background 0.2s;
        font-weight: 600;
      }

      #learning-agent-chatbot .api-key-setup button:hover {
        background: #7c3aed;
      }

      #learning-agent-chatbot .api-key-setup .info {
        font-size: 11px;
        color: #9ca3af;
        margin-top: 12px;
      }

      #learning-agent-chatbot .api-key-setup .info a {
        color: #8b5cf6;
        text-decoration: none;
        font-weight: 600;
      }

      #learning-agent-chatbot .api-key-setup .info a:hover {
        color: #7c3aed;
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(chatWindow);

    // Initialize UI
    updateChatWindow();
    attachEventListeners();
  }

  function updateChatWindow() {
    const messagesContainer = document.getElementById('learning-chat-messages');
    if (!messagesContainer) return;

    if (!apiKey) {
      messagesContainer.innerHTML = `
        <div class="api-key-setup">
          <h3>Setup Groq API Key</h3>
          <input type="password" id="learning-api-key-input" placeholder="Enter your Groq API key" />
          <button id="learning-save-api-key">Save API Key</button>
          <p class="info">
            Get your free API key from 
            <a href="https://console.groq.com" target="_blank">console.groq.com</a>
          </p>
        </div>
      `;
      
      const saveBtn = document.getElementById('learning-save-api-key');
      const input = document.getElementById('learning-api-key-input');
      
      saveBtn.onclick = () => {
        const key = input.value.trim();
        if (key) {
          chrome.storage.local.set({ groqApiKey: key }, () => {
            apiKey = key;
            messages = [];
            updateChatWindow();
          });
        }
      };
      
      input.onkeydown = (e) => {
        if (e.key === 'Enter') {
          saveBtn.click();
        }
      };
    } else if (messages.length === 0) {
      messagesContainer.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
          </svg>
          <p><strong>Ask me anything about this page!</strong></p>
          <p style="font-size: 11px; margin-top: 4px;">I can help you understand content, summarize articles, explain concepts, and more.</p>
        </div>
      `;
    } else {
      messagesContainer.innerHTML = messages.map(msg => {
        if (msg.type === 'assistant') {
          return `<div class="message ${msg.type}"><div class="markdown-content">${renderMarkdown(msg.text)}</div></div>`;
        } else if (msg.type === 'user') {
          return `<div class="message ${msg.type}">${escapeHtml(msg.text)}</div>`;
        } else {
          return `<div class="message ${msg.type}">${escapeHtml(msg.text)}</div>`;
        }
      }).join('');
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  function attachEventListeners() {
    const header = chatWindow.querySelector('.chat-header');
    const collapseBtn = chatWindow.querySelector('.collapse-btn');
    const closeBtn = chatWindow.querySelector('.close-btn');
    const sendBtn = document.getElementById('learning-chat-send');
    const input = document.getElementById('learning-chat-input');
    const settingsBtn = document.getElementById('learning-settings-btn');

    // Dragging
    header.addEventListener('mousedown', (e) => {
      if (e.target.closest('.chat-btn')) return;
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      const rect = chatWindow.getBoundingClientRect();
      windowStartX = rect.left;
      windowStartY = rect.top;
      chatWindow.style.transition = 'none';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartX;
      const deltaY = e.clientY - dragStartY;
      chatWindow.style.left = (windowStartX + deltaX) + 'px';
      chatWindow.style.top = (windowStartY + deltaY) + 'px';
      chatWindow.style.right = 'auto';
      chatWindow.style.bottom = 'auto';
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        chatWindow.style.transition = '';
      }
    });

    // Collapse
    collapseBtn.addEventListener('click', () => {
      isCollapsed = !isCollapsed;
      chatWindow.classList.toggle('collapsed', isCollapsed);
    });

    // Close
    closeBtn.addEventListener('click', () => {
      cleanup();
    });

    // Send message
    const sendMessage = async () => {
      const query = input.value.trim();
      if (!query || !apiKey) return;

      input.value = '';
      messages.push({ text: query, type: 'user' });
      updateChatWindow();

      messages.push({ text: 'Analyzing page content...', type: 'loading' });
      updateChatWindow();
      sendBtn.disabled = true;

      try {
        const pageContent = extractPageContent();
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'system',
                content: `You are a helpful learning assistant analyzing web page content. The user is viewing a page with the following information:\n\nURL: ${pageContent.url}\nTitle: ${pageContent.title}\n\nPage Content:\n${pageContent.text}\n\nAnswer questions about the page content, help explain concepts, summarize information, and assist with learning. Be concise, clear, and educational.`
              },
              {
                role: 'user',
                content: query
              }
            ],
            temperature: 0.7,
            max_tokens: 1024
          })
        });

        messages.pop(); // Remove loading message

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const answer = data.choices[0].message.content;
        messages.push({ text: answer, type: 'assistant' });
        updateChatWindow();

      } catch (error) {
        messages.pop(); // Remove loading message
        messages.push({ text: `Error: ${error.message}`, type: 'error' });
        updateChatWindow();
      } finally {
        sendBtn.disabled = false;
      }
    };

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Settings
    settingsBtn.addEventListener('click', () => {
      const changeKey = confirm('Do you want to change your API key?');
      if (changeKey) {
        apiKey = null;
        messages = [];
        chrome.storage.local.remove('groqApiKey');
        updateChatWindow();
      }
    });
  }

  function extractPageContent() {
    const content = {
      url: window.location.href,
      title: document.title,
      text: ''
    };

    // Extract main content
    const mainContent = document.querySelector('main, article, [role="main"], .content, #content');
    if (mainContent) {
      content.text = mainContent.innerText.substring(0, 8000);
    } else {
      // Fallback to body text
      content.text = document.body.innerText.substring(0, 8000);
    }

    // Extract meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      content.text = `Description: ${metaDesc.content}\n\n${content.text}`;
    }

    // Extract headings for structure
    const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
      .slice(0, 10)
      .map(h => h.innerText.trim())
      .filter(h => h.length > 0);
    
    if (headings.length > 0) {
      content.text = `Key Topics: ${headings.join(', ')}\n\n${content.text}`;
    }

    return content;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function cleanup() {
    if (chatWindow) {
      chatWindow.remove();
      chatWindow = null;
    }
  }

  // Create the window
  createChatWindow();

  return {
    cleanup: cleanup
  };
}


// ========== Main Initialization ==========
let activeFeatures = {};
let currentToggles = {};

function handleFeatureToggle(key, value) {
  console.log('🔄 handleFeatureToggle called:', key, '=', value);
  
  if (value && !activeFeatures[key]) {
    // Initialize feature
    console.log('✅ Initializing feature:', key);
    switch(key) {
      case 'fontFinder':
        activeFeatures[key] = initFontFinder();
        break;
      case 'colorFinder':
        activeFeatures[key] = initColorFinder();
        break;
      case 'editCookie':
        activeFeatures[key] = initEditCookie();
        break;
      case 'checkSEO':
        activeFeatures[key] = initCheckSEO();
        break;
      case 'focusMode':
        activeFeatures[key] = initFocusMode();
        break;
      case 'focusDetection':
        activeFeatures[key] = initFocusDetection();
        break;
      case 'passiveWatching':
        console.log('🚀 NUCLEAR MODE: Initializing...');
        activeFeatures[key] = initPassiveWatching();
        console.log('🚀 NUCLEAR MODE: Initialized');
        break;
      case 'energyScheduling':
        activeFeatures[key] = initEnergyScheduling();
        break;
      case 'speedImprover':
        activeFeatures[key] = initSpeedImprover();
        break;
      case 'githubAgent':
        if (window.location.hostname.includes('github.com')) {
          activeFeatures[key] = {
            chatbot: initGitHubChatbotUI(),
            navigation: initGitHubNavigation()
          };
        }
        break;
      case 'learningAgent':
        activeFeatures[key] = initLearningAgentUI();
        break;
    }
  } else if (!value && activeFeatures[key]) {
    // Cleanup feature
    console.log('❌ Cleaning up feature:', key);
    if (key === 'passiveWatching') {
      console.log('🛑 NUCLEAR MODE: Toggled OFF - Running cleanup...');
    }
    if (activeFeatures[key].cleanup) {
      activeFeatures[key].cleanup();
      console.log('✅ Cleanup completed for:', key);
    }
    delete activeFeatures[key];
    console.log('✅ Feature removed from activeFeatures:', key);
  } else {
    console.log('⚠️ No action needed for:', key, '(value:', value, ', exists:', !!activeFeatures[key], ')');
  }
}

function initializeFeatures() {
  Object.keys(currentToggles).forEach(key => {
    if (currentToggles[key]) {
      handleFeatureToggle(key, true);
    }
  });
}

// Load initial state
browserAPI.storage.sync.get(null, (data) => {
  currentToggles = data;
  initializeFeatures();
});

// Listen for toggle changes
browserAPI.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    Object.keys(changes).forEach(key => {
      const newValue = changes[key].newValue;
      currentToggles[key] = newValue;
      handleFeatureToggle(key, newValue);
    });
  }
});

// Listen for messages from background
browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TOGGLE_UPDATE') {
    currentToggles[message.key] = message.value;
    handleFeatureToggle(message.key, message.value);
  }
});

console.log('Content script loaded');
