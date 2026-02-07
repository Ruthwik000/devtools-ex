// Content Script Bundle - Auto-generated
// Cross-browser API compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;


// ========== markdown-renderer.js ==========
// Simple Markdown Renderer for Chat Messages
// Converts markdown to HTML with proper formatting
// Added for Learning Agent & GitHub Agent markdown support

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
    // Update the toggles object to turn off the feature
    browserAPI.storage.sync.get(['toggles'], (data) => {
      const toggles = data.toggles || {};
      toggles.fontFinder = false;
      browserAPI.storage.sync.set({ toggles });
    });
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
      // Try modern EyeDropper API first (captures actual rendered pixels)
      if (window.EyeDropper) {
        try {
          const eyeDropper = new EyeDropper();
          const result = await eyeDropper.open();
          
          // Parse the hex color to RGB
          const hex = result.sRGBHex;
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          
          return { r, g, b };
        } catch (e) {
          // User cancelled or error occurred
          if (e.name !== 'AbortError') {
            console.log('EyeDropper error:', e);
          }
          return null;
        }
      }

      // Fallback: Use element inspection and canvas sampling
      const element = document.elementFromPoint(x, y);
      if (!element) return null;

      // Try to capture from images, canvas, video
      if (element.tagName === 'IMG' || element.tagName === 'CANVAS' || element.tagName === 'VIDEO') {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
        const rect = element.getBoundingClientRect();
        
        tempCanvas.width = rect.width;
        tempCanvas.height = rect.height;
        
        try {
          tempCtx.drawImage(element, 0, 0, rect.width, rect.height);
          const localX = Math.floor(x - rect.left);
          const localY = Math.floor(y - rect.top);
          const imageData = tempCtx.getImageData(localX, localY, 1, 1);
          return {
            r: imageData.data[0],
            g: imageData.data[1],
            b: imageData.data[2]
          };
        } catch (e) {
          console.log('Cannot read pixel data (CORS):', e);
        }
      }

      // Try to capture from SVG
      if (element.tagName === 'svg' || element.ownerSVGElement) {
        const computedStyle = window.getComputedStyle(element);
        const fill = computedStyle.fill;
        const stroke = computedStyle.stroke;
        
        let color = fill !== 'none' ? fill : stroke;
        if (color && color !== 'none') {
          const rgbMatch = color.match(/\d+/g);
          if (rgbMatch && rgbMatch.length >= 3) {
            return {
              r: parseInt(rgbMatch[0]),
              g: parseInt(rgbMatch[1]),
              b: parseInt(rgbMatch[2])
            };
          }
        }
      }

      // Get computed styles (works for gradients, solid colors, etc.)
      const computedStyle = window.getComputedStyle(element);
      let color = computedStyle.backgroundColor;
      
      // If transparent, try other properties
      if (color === 'rgba(0, 0, 0, 0)' || color === 'transparent') {
        color = computedStyle.color || computedStyle.borderColor;
      }

      // Parse RGB/RGBA
      const rgbMatch = color.match(/\d+/g);
      if (rgbMatch && rgbMatch.length >= 3) {
        return {
          r: parseInt(rgbMatch[0]),
          g: parseInt(rgbMatch[1]),
          b: parseInt(rgbMatch[2])
        };
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
    
    // If EyeDropper API is available, it handles its own UI
    if (window.EyeDropper) {
      deactivateEyedropper();
      const color = await getPixelColor(e.clientX, e.clientY);
      if (color) {
        updateColorDisplay(color.r, color.g, color.b);
        addToHistory(color.r, color.g, color.b);
        showNotification('Color picked!');
        // Show the panel again after picking
        if (panel) {
          panel.style.display = 'flex';
        }
      } else {
        // User cancelled, show panel
        if (panel) {
          panel.style.display = 'flex';
        }
      }
    } else {
      // Fallback method
      const color = await getPixelColor(e.clientX, e.clientY);
      if (color) {
        updateColorDisplay(color.r, color.g, color.b);
        addToHistory(color.r, color.g, color.b);
        deactivateEyedropper();
        showNotification('Color picked!');
        // Show the panel again after picking
        if (panel) {
          panel.style.display = 'flex';
        }
      }
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
        // Show the panel again when canceling
        if (panel) {
          panel.style.display = 'flex';
        }
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
      width: 450px; min-width: 400px; min-height: 500px;
      background: #37353E;
      border: 1px solid #44444E;
      border-radius: 16px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      z-index: 9999999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      overflow: hidden; display: flex; flex-direction: column;
      resize: both;
    `;

    panel.innerHTML = `
      <div id="cf-header" style="background: #44444E; padding: 20px; border-bottom: 1px solid #715A5A; cursor: move; user-select: none;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; font-size: 20px; color: #D3DAD9; font-weight: 700;">ColorFinder</h2>
          <button id="close-panel" style="background: rgba(113, 90, 90, 0.3); border: none; font-size: 24px; color: #D3DAD9; cursor: pointer; padding: 0; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: all 0.2s;">×</button>
        </div>
      </div>

      <div style="padding: 24px; flex: 1; overflow-y: auto; background: #37353E;">
        <!-- Menu Items -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <button class="menu-item" data-action="pick-page" style="display: flex; align-items: center; gap: 14px; padding: 16px 18px; background: #44444E; border: 1px solid #715A5A; border-radius: 12px; cursor: pointer; transition: all 0.2s; width: 100%; text-align: left;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D3DAD9" stroke-width="2.5">
              <path d="M7 17L17 7M17 7H7M17 7V17"/>
            </svg>
            <span style="font-size: 15px; color: #D3DAD9; font-weight: 600;">Pick Color From Page</span>
          </button>

          <button class="menu-item" data-action="color-picker" style="display: flex; align-items: center; gap: 14px; padding: 16px 18px; background: #44444E; border: 1px solid #715A5A; border-radius: 12px; cursor: pointer; transition: all 0.2s; width: 100%; text-align: left;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#D3DAD9" opacity="0.3"/>
              <circle cx="12" cy="12" r="6" fill="#D3DAD9"/>
            </svg>
            <span style="font-size: 15px; color: #D3DAD9; font-weight: 600;">Color Picker</span>
          </button>

          <button class="menu-item" data-action="history" style="display: flex; align-items: center; gap: 14px; padding: 16px 18px; background: #44444E; border: 1px solid #715A5A; border-radius: 12px; cursor: pointer; transition: all 0.2s; width: 100%; text-align: left;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D3DAD9" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span style="font-size: 15px; color: #D3DAD9; font-weight: 600;">Picked Color History</span>
          </button>
        </div>

        <div style="height: 1px; background: #715A5A; margin: 20px 0;"></div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <button class="menu-item" data-action="analyzer" style="display: flex; align-items: center; gap: 14px; padding: 16px 18px; background: #44444E; border: 1px solid #715A5A; border-radius: 12px; cursor: pointer; transition: all 0.2s; width: 100%; text-align: left;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D3DAD9" stroke-width="2.5">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <span style="font-size: 15px; color: #D3DAD9; font-weight: 600;">Webpage Color Analyzer</span>
          </button>
        </div>
      </div>

      <div id="resize-handle" style="position: absolute; bottom: 0; right: 0; width: 24px; height: 24px; cursor: nwse-resize; background: linear-gradient(135deg, transparent 50%, #715A5A 50%); border-radius: 0 0 16px 0;"></div>
    `;

    document.body.appendChild(panel);

    // Add event listeners
    panel.querySelector('#close-panel').addEventListener('click', () => {
      panel.remove();
      // Update the toggles object to turn off the feature
      browserAPI.storage.sync.get(['toggles'], (data) => {
        const toggles = data.toggles || {};
        toggles.colorFinder = false;
        browserAPI.storage.sync.set({ toggles });
      });
    });

    // Hover effects for close button
    panel.querySelector('#close-panel').addEventListener('mouseenter', function() {
      this.style.background = 'rgba(113, 90, 90, 0.6)';
    });
    panel.querySelector('#close-panel').addEventListener('mouseleave', function() {
      this.style.background = 'rgba(113, 90, 90, 0.3)';
    });

    // Menu item hover effects and actions
    panel.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('mouseenter', function() {
        this.style.background = '#715A5A';
        this.style.transform = 'translateX(4px)';
      });
      item.addEventListener('mouseleave', function() {
        this.style.background = '#44444E';
        this.style.transform = 'translateX(0)';
      });

      item.addEventListener('click', function() {
        const action = this.dataset.action;
        handleMenuAction(action);
      });
    });

    // Make draggable
    makeDraggable(panel);
    
    // Make resizable
    makeResizable(panel);
  }

  // Make panel resizable
  function makeResizable(panel) {
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
      panel.style.height = Math.max(500, startHeight + dy) + 'px';
    });

    document.addEventListener('mouseup', () => {
      isResizing = false;
    });
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
      <div style="padding: 20px; background: #37353E; height: 100%;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <button id="back-btn" style="background: none; border: none; color: #D3DAD9; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 4px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
          <h3 style="margin: 0; font-size: 16px; color: #D3DAD9;">Color Picker</h3>
          <button id="close-panel" style="background: none; border: none; font-size: 24px; color: #D3DAD9; cursor: pointer;">×</button>
        </div>

        <div id="color-preview" style="width: 100%; height: 80px; border-radius: 8px; margin-bottom: 16px; background: rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b}); border: 2px solid #715A5A;"></div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #44444E; border-radius: 6px; border: 1px solid #715A5A;">
            <span id="hex-value" style="font-family: monospace; font-size: 14px; color: #D3DAD9;">${rgbToHex(currentColor.r, currentColor.g, currentColor.b)}</span>
            <button class="copy-btn" data-format="hex" style="background: #715A5A; color: #D3DAD9; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Copy</button>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #44444E; border-radius: 6px; border: 1px solid #715A5A;">
            <span id="rgb-value" style="font-family: monospace; font-size: 14px; color: #D3DAD9;">rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})</span>
            <button class="copy-btn" data-format="rgb" style="background: #715A5A; color: #D3DAD9; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Copy</button>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #44444E; border-radius: 6px; border: 1px solid #715A5A;">
            <span id="hsl-value" style="font-family: monospace; font-size: 14px; color: #D3DAD9;">hsl(${rgbToHsl(currentColor.r, currentColor.g, currentColor.b).h}, ${rgbToHsl(currentColor.r, currentColor.g, currentColor.b).s}%, ${rgbToHsl(currentColor.r, currentColor.g, currentColor.b).l}%)</span>
            <button class="copy-btn" data-format="hsl" style="background: #715A5A; color: #D3DAD9; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Copy</button>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #44444E; border-radius: 6px; border: 1px solid #715A5A;">
            <span id="hsv-value" style="font-family: monospace; font-size: 14px; color: #D3DAD9;">hsv(${rgbToHsv(currentColor.r, currentColor.g, currentColor.b).h}, ${rgbToHsv(currentColor.r, currentColor.g, currentColor.b).s}%, ${rgbToHsv(currentColor.r, currentColor.g, currentColor.b).v}%)</span>
            <button class="copy-btn" data-format="hsv" style="background: #715A5A; color: #D3DAD9; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Copy</button>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #44444E; border-radius: 6px; border: 1px solid #715A5A;">
            <span id="cmyk-value" style="font-family: monospace; font-size: 14px; color: #D3DAD9;">cmyk(${rgbToCmyk(currentColor.r, currentColor.g, currentColor.b).c}%, ${rgbToCmyk(currentColor.r, currentColor.g, currentColor.b).m}%, ${rgbToCmyk(currentColor.r, currentColor.g, currentColor.b).y}%, ${rgbToCmyk(currentColor.r, currentColor.g, currentColor.b).k}%)</span>
            <button class="copy-btn" data-format="cmyk" style="background: #715A5A; color: #D3DAD9; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Copy</button>
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
          <div class="history-item" data-rgb="${color.r},${color.g},${color.b}" style="display: flex; align-items: center; gap: 12px; padding: 12px; background: #44444E; border: 1px solid #715A5A; border-radius: 6px; cursor: pointer; transition: all 0.2s;">
            <div style="width: 40px; height: 40px; border-radius: 6px; background: rgb(${color.r}, ${color.g}, ${color.b}); border: 2px solid #715A5A; flex-shrink: 0;"></div>
            <div style="flex: 1;">
              <div style="font-family: monospace; font-size: 14px; color: #D3DAD9; font-weight: 600;">${color.hex}</div>
              <div style="font-size: 12px; color: #D3DAD9; opacity: 0.7;">rgb(${color.r}, ${color.g}, ${color.b})</div>
            </div>
            <button class="copy-history-btn" data-hex="${color.hex}" style="background: #715A5A; color: #D3DAD9; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Copy</button>
          </div>
        `).join('')
      : '<div style="text-align: center; padding: 40px; color: #D3DAD9; opacity: 0.6;">No colors picked yet. Use "Pick Color From Page" to start!</div>';

    panel.innerHTML = `
      <div style="padding: 20px; background: #37353E; height: 100%;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <button id="back-btn" style="background: none; border: none; color: #D3DAD9; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 4px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
          <h3 style="margin: 0; font-size: 16px; color: #D3DAD9;">Color History</h3>
          <button id="close-panel" style="background: none; border: none; font-size: 24px; color: #D3DAD9; cursor: pointer;">×</button>
        </div>

        <div style="max-height: 400px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
          ${historyHTML}
        </div>

        ${colorHistory.length > 0 ? '<button id="clear-history" style="width: 100%; margin-top: 16px; padding: 10px; background: #715A5A; color: #D3DAD9; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">Clear History</button>' : ''}
      </div>
    `;

    attachCommonHandlers();

    // History item click
    panel.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('mouseenter', function() {
        this.style.background = '#715A5A';
      });
      item.addEventListener('mouseleave', function() {
        this.style.background = '#44444E';
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
      <div style="padding: 20px; background: #37353E; height: 100%;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <button id="back-btn" style="background: none; border: none; color: #D3DAD9; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 4px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
          <h3 style="margin: 0; font-size: 16px; color: #D3DAD9;">Webpage Colors</h3>
          <button id="close-panel" style="background: none; border: none; font-size: 24px; color: #D3DAD9; cursor: pointer;">×</button>
        </div>

        <div style="margin-bottom: 12px; color: #D3DAD9; opacity: 0.7; font-size: 14px;">Found ${colorArray.length} unique colors</div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; max-height: 400px; overflow-y: auto;">
          ${colorArray.map(color => `
            <div class="analyzer-color" data-rgb="${color.r},${color.g},${color.b}" style="cursor: pointer; transition: all 0.2s;">
              <div style="width: 100%; aspect-ratio: 1; background: rgb(${color.r}, ${color.g}, ${color.b}); border-radius: 8px; border: 2px solid #715A5A; margin-bottom: 6px;"></div>
              <div style="font-family: monospace; font-size: 11px; color: #D3DAD9; text-align: center;">${rgbToHex(color.r, color.g, color.b)}</div>
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
        // Update the toggles object to turn off the feature
        browserAPI.storage.sync.get(['toggles'], (data) => {
          const toggles = data.toggles || {};
          toggles.colorFinder = false;
          browserAPI.storage.sync.set({ toggles });
        });
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
    const header = element.querySelector('#cf-header');
    let isDragging = false;
    let startX, startY, startLeft, startTop;

    header.addEventListener('mousedown', function(e) {
      if (e.target.id === 'close-panel' || e.target.closest('#close-panel')) return;
      
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = element.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      element.style.transform = 'none';
      header.style.cursor = 'grabbing';
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
        header.style.cursor = 'move';
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
    browserAPI.runtime.sendMessage({ type: 'GET_COOKIES', url: window.location.href }, (response) => {
      if (response && response.cookies) {
        allCookies = response.cookies;
        filteredCookies = allCookies;
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
    browserAPI.runtime.sendMessage({ 
      type: 'REMOVE_COOKIE', 
      url: window.location.href, 
      name: name,
      domain: domain
    }, (response) => {
      if (response && response.success) {
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

    browserAPI.runtime.sendMessage({ 
      type: 'SET_COOKIE', 
      url: window.location.href,
      cookie: cookieData
    }, (response) => {
      if (response && response.success) {
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
    // Update the toggles object to turn off the feature
    browserAPI.storage.sync.get(['toggles'], (data) => {
      const toggles = data.toggles || {};
      toggles.editCookie = false;
      browserAPI.storage.sync.set({ toggles });
    });
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
    // Update the toggles object to turn off the feature
    browserAPI.storage.sync.get(['toggles'], (data) => {
      const toggles = data.toggles || {};
      toggles.checkSEO = false;
      browserAPI.storage.sync.set({ toggles });
    });
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


// ========== github-chatbot-ui.js ==========
// GitHub Chatbot UI - Floating, collapsible, movable window
// Updated to support markdown rendering for formatted responses
function initGitHubChatbotUI() {
  console.log('🤖 Initializing GitHub Chatbot UI...');
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
  chrome.storage.sync.get(['groqApiKey'], (result) => {
    if (result.groqApiKey) {
      apiKey = result.groqApiKey;
      if (chatWindow) {
        updateChatWindow();
      }
    }
  });

  function createChatWindow() {
    if (chatWindow) return;
    
    // Ensure DOM is ready
    if (!document.body) {
      setTimeout(createChatWindow, 100);
      return;
    }

    chatWindow = document.createElement('div');
    chatWindow.id = 'github-ai-chatbot';
    chatWindow.innerHTML = `
      <div class="chat-header">
        <div class="chat-title">
          <svg width="20" height="20" viewBox="0 0 16 16" fill="#58a6ff">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          <span style="color: #58a6ff;">GitHub AI Assistant</span>
        </div>
        <div class="chat-controls">
          <button class="chat-btn" id="github-settings-btn" title="Settings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
            </svg>
          </button>
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
      <div class="resize-handle" style="position: absolute; bottom: 0; right: 0; width: 20px; height: 20px; cursor: nwse-resize; background: linear-gradient(135deg, transparent 50%, #30363d 50%); border-radius: 0 0 16px 0;"></div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      #github-ai-chatbot {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 420px;
        min-width: 350px;
        max-height: 650px;
        min-height: 400px;
        background: #0d1117;
        border: 1px solid #30363d;
        border-radius: 16px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        z-index: 999999;
        display: flex;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #c9d1d9;
        transition: max-height 0.3s ease;
        resize: both;
        overflow: hidden;
      }

      #github-ai-chatbot.collapsed {
        width: 240px;
        min-width: 240px;
        max-height: 60px;
        min-height: 60px;
        height: 60px;
        resize: none;
        border-radius: 30px;
      }

      #github-ai-chatbot.collapsed .chat-title {
        font-size: 14px;
      }

      #github-ai-chatbot.collapsed .chat-title span {
        display: inline;
      }

      .chat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        background: #161b22;
        border-bottom: 1px solid #30363d;
        border-radius: 16px 16px 0 0;
        cursor: move;
        user-select: none;
      }

      #github-ai-chatbot.collapsed .chat-header {
        border-radius: 30px;
        border-bottom: none;
        padding: 12px 16px;
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

      #github-ai-chatbot.collapsed .chat-controls {
        gap: 6px;
      }

      #github-ai-chatbot.collapsed #github-settings-btn {
        display: none;
      }

      .chat-btn {
        background: rgba(48, 54, 61, 0.5);
        border: none;
        color: #8b949e;
        cursor: pointer;
        padding: 6px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        width: 32px;
        height: 32px;
        flex-shrink: 0;
      }

      #github-ai-chatbot.collapsed .chat-btn {
        width: 28px;
        height: 28px;
        padding: 5px;
      }

      .chat-btn:hover {
        background: rgba(48, 54, 61, 0.8);
        color: #c9d1d9;
      }

      .close-btn:hover {
        background: rgba(218, 54, 51, 0.8) !important;
        color: white !important;
      }

      .chat-body {
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: hidden;
        background: #0d1117;
        position: relative;
      }

      #github-ai-chatbot.collapsed .chat-body {
        display: none;
      }

      #github-ai-chatbot.collapsed .resize-handle {
        display: none;
      }

      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        padding-bottom: 80px;
        display: flex;
        flex-direction: column;
        gap: 12px;
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
        padding: 10px 14px;
        border-radius: 8px;
        font-size: 13px;
        line-height: 1.5;
        max-width: 85%;
        word-wrap: break-word;
      }

      .message.user {
        background: #21262d;
        color: white;
        align-self: flex-end;
        margin-left: auto;
        border: 1px solid #30363d;
      }

      .message.assistant {
        background: #161b22;
        color: #c9d1d9;
        align-self: flex-start;
        border: 1px solid #30363d;
      }

      .message.error {
        background: #3d1e1e;
        color: #f85149;
        align-self: flex-start;
        border: 1px solid #da3633;
      }

      .message.loading {
        background: #161b22;
        color: #8b949e;
        font-style: italic;
        align-self: flex-start;
        border: 1px solid #30363d;
      }

      .chat-input-area {
        display: flex;
        gap: 8px;
        align-items: flex-end;
        padding: 16px;
        border-top: 1px solid #30363d;
        background: #0d1117;
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
      }

      #chat-input {
        flex: 1;
        background: #0d1117;
        border: 1px solid #30363d;
        border-radius: 20px;
        padding: 10px 16px;
        color: #c9d1d9;
        font-size: 14px;
        font-family: inherit;
        resize: none;
        outline: none;
        transition: all 0.2s;
        min-height: 40px;
        max-height: 40px;
        line-height: 1.5;
        overflow-y: hidden;
      }

      #chat-input:focus {
        border-color: #58a6ff;
        background: #0d1117;
      }

      #chat-input::placeholder {
        color: #6B7280;
      }

      .send-btn {
        background: #58a6ff;
        border: none;
        border-radius: 50%;
        padding: 0;
        width: 40px;
        height: 40px;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        flex-shrink: 0;
      }

      .send-btn:hover {
        background: #1f6feb;
        color: white;
      }

      .send-btn:disabled {
        background: #21262d;
        cursor: not-allowed;
        opacity: 0.5;
        color: #6B7280;
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
    makeResizable();
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
          chrome.storage.sync.set({ groqApiKey: key }, () => {
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
    const settingsBtn = document.getElementById('github-settings-btn');

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
      // Update the toggles object to turn off the feature
      const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
      browserAPI.storage.sync.get(['toggles'], (data) => {
        const toggles = data.toggles || {};
        toggles.githubAgent = false;
        browserAPI.storage.sync.set({ toggles });
      });
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
        chrome.storage.sync.remove('groqApiKey');
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

  function makeResizable() {
    const handle = chatWindow.querySelector('.resize-handle');
    if (!handle) return;

    let isResizing = false;
    let startX, startY, startWidth, startHeight;

    handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = chatWindow.getBoundingClientRect();
      startWidth = rect.width;
      startHeight = rect.height;
      chatWindow.style.transition = 'none';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      const newWidth = Math.max(320, startWidth + deltaX);
      const newHeight = Math.max(200, startHeight + deltaY);
      chatWindow.style.width = newWidth + 'px';
      chatWindow.style.maxHeight = newHeight + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        chatWindow.style.transition = '';
      }
    });
  }

  function cleanup() {
    if (chatWindow) {
      chatWindow.remove();
      chatWindow = null;
    }
  }

  // Create the window
  console.log('🤖 Creating GitHub chatbot window...');
  createChatWindow();

  return {
    cleanup: cleanup
  };
}


// ========== learning-agent-ui.js ==========
// Learning Agent UI - Universal page content analyzer
// Uses Groq API to answer questions about any webpage
// Includes markdown rendering for formatted responses
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
  const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
  browserAPI.storage.sync.get(['groqApiKey'], (result) => {
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
          <img src="${browserAPI.runtime.getURL('logos/learning-agent-logo.png')}" alt="Learning Agent" style="width: 24px; height: 24px; object-fit: cover; flex-shrink: 0; border-radius: 50%; background: linear-gradient(135deg, #1F2937 0%, #111827 100%); overflow: hidden;">
          <span>Learning Assistant</span>
        </div>
        <div class="chat-controls">
          <button class="chat-btn" id="learning-settings-btn" title="Settings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
            </svg>
          </button>
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
          <textarea id="learning-chat-input" placeholder="Ask about this page..." rows="1"></textarea>
          <button id="learning-chat-send" class="send-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      #learning-agent-chatbot {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 420px;
        min-width: 350px;
        max-height: 650px;
        min-height: 400px;
        background: linear-gradient(135deg, #1F2937 0%, #111827 100%);
        border: 1px solid #374151;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
        z-index: 999999;
        display: flex;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #f3f4f6;
        transition: max-height 0.3s ease;
        overflow: hidden;
        resize: both;
      }

      #learning-agent-chatbot.collapsed {
        width: 240px;
        min-width: 240px;
        max-height: 60px;
        min-height: 60px;
        height: 60px;
        resize: none;
        border-radius: 30px;
      }

      #learning-agent-chatbot.collapsed .chat-title {
        font-size: 14px;
      }

      #learning-agent-chatbot.collapsed .chat-title span {
        display: inline;
      }

      #learning-agent-chatbot .chat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        background: linear-gradient(135deg, #1F2937 0%, #111827 100%);
        border-bottom: 1px solid rgba(55, 65, 81, 0.3);
        cursor: move;
        user-select: none;
        border-radius: 16px 16px 0 0;
      }

      #learning-agent-chatbot.collapsed .chat-header {
        border-radius: 30px;
        border-bottom: none;
        padding: 12px 16px;
      }

      #learning-agent-chatbot .chat-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 700;
        font-size: 16px;
        color: #FFFFFF;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        white-space: nowrap;
        overflow: hidden;
      }

      #learning-agent-chatbot .chat-title img {
        flex-shrink: 0;
        border-radius: 50%;
        overflow: hidden;
      }

      #learning-agent-chatbot .chat-controls {
        display: flex;
        gap: 8px;
      }

      #learning-agent-chatbot.collapsed .chat-controls {
        gap: 6px;
      }

      #learning-agent-chatbot.collapsed #learning-settings-btn {
        display: none;
      }

      #learning-agent-chatbot .chat-btn {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: #FFFFFF;
        cursor: pointer;
        padding: 6px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        width: 32px;
        height: 32px;
        flex-shrink: 0;
      }

      #learning-agent-chatbot.collapsed .chat-btn {
        width: 28px;
        height: 28px;
        padding: 5px;
      }

      #learning-agent-chatbot .chat-btn:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
      }

      #learning-agent-chatbot .close-btn:hover {
        background: rgba(239, 68, 68, 0.9);
      }

      #learning-agent-chatbot .chat-body {
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: hidden;
        background: #1F2937;
        position: relative;
      }

      #learning-agent-chatbot.collapsed .chat-body {
        display: none;
      }

      #learning-agent-chatbot .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        padding-bottom: 80px;
        display: flex;
        flex-direction: column;
        gap: 12px;
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
        background: linear-gradient(135deg, #374151 0%, #1F2937 100%);
        color: white;
        align-self: flex-end;
        margin-left: auto;
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
      }

      #learning-agent-chatbot .message.assistant {
        background: #374151;
        color: #E5E7EB;
        align-self: flex-start;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      }

      #learning-agent-chatbot .message.error {
        background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
        color: white;
        align-self: flex-start;
        box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
      }

      #learning-agent-chatbot .message.loading {
        background: #374151;
        color: #9CA3AF;
        font-style: italic;
        align-self: flex-start;
      }

      #learning-agent-chatbot .chat-input-area {
        display: flex;
        gap: 8px;
        align-items: center;
        padding: 12px 16px;
        padding: 16px;
        border-top: 1px solid #374151;
        background: #111827;
        align-items: flex-end;
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
      }

      #learning-agent-chatbot #learning-chat-input {
        flex: 1;
        background: #1F2937;
        border: 2px solid #374151;
        border-radius: 20px;
        padding: 10px 16px;
        color: #E5E7EB;
        font-size: 14px;
        font-family: inherit;
        resize: none;
        outline: none;
        transition: all 0.2s;
        min-height: 40px;
        max-height: 40px;
        line-height: 1.5;
        overflow-y: hidden;
      }

      #learning-agent-chatbot #learning-chat-input:focus {
        border-color: #3B82F6;
        background: #1F2937;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
      }

      #learning-agent-chatbot #learning-chat-input::placeholder {
        color: #6B7280;
      }

      #learning-agent-chatbot .send-btn {
        background: linear-gradient(135deg, #374151 0%, #1F2937 100%);
        border: none;
        border-radius: 50%;
        padding: 0;
        width: 40px;
        height: 40px;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        flex-shrink: 0;
      }

      #learning-agent-chatbot .send-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      }

      #learning-agent-chatbot .send-btn:disabled {
        background: #4B5563;
        cursor: not-allowed;
        opacity: 0.6;
        transform: none;
        box-shadow: none;
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
        border-color: #3B82F6;
      }

      #learning-agent-chatbot .api-key-setup input::placeholder {
        color: #6b7280;
      }

      #learning-agent-chatbot .api-key-setup button {
        width: 100%;
        background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
        border: none;
        border-radius: 6px;
        padding: 10px 16px;
        color: white;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
        font-weight: 600;
      }

      #learning-agent-chatbot .api-key-setup button:hover {
        background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      }

      #learning-agent-chatbot .api-key-setup .info {
        font-size: 11px;
        color: #9ca3af;
        margin-top: 12px;
      }

      #learning-agent-chatbot .api-key-setup .info a {
        color: #3B82F6;
        text-decoration: none;
        font-weight: 600;
      }

      #learning-agent-chatbot .api-key-setup .info a:hover {
        color: #2563EB;
        text-decoration: underline;
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
          browserAPI.storage.sync.set({ groqApiKey: key }, () => {
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
      // Update the toggles object to turn off the feature
      browserAPI.storage.sync.get(['toggles'], (data) => {
        const toggles = data.toggles || {};
        toggles.learningAgent = false;
        browserAPI.storage.sync.set({ toggles });
      });
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
        browserAPI.storage.sync.remove('groqApiKey');
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
    if (healingInterval) {
      clearInterval(healingInterval);
    }
  }

  // Self-healing: Ensure UI exists and is in the DOM
  function ensureUIExists() {
    // Check if chatWindow exists in DOM
    const existingWindow = document.getElementById('learning-agent-chatbot');

    if (!existingWindow && document.body) {
      console.log('Learning Agent UI missing - recreating...');
      createChatWindow();
      console.log('Learning Agent UI restored');
    } else if (existingWindow && !chatWindow) {
      // Window exists but we lost reference
      chatWindow = existingWindow;
    }
  }

  // Create the window
  createChatWindow();

  // Self-healing interval - check every 2 seconds if UI exists
  const healingInterval = setInterval(ensureUIExists, 2000);

  return {
    cleanup: cleanup
  };
}


// ========== Main Initialization ==========
let activeFeatures = {};
let currentToggles = {};

function handleFeatureToggle(key, value) {
  if (value && !activeFeatures[key]) {
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
      case 'nuclearMode':
        activeFeatures[key] = initNuclearMode();
        break;
      case 'speedImprover':
        activeFeatures[key] = initSpeedImprover();
        break;
      case 'githubAgent':
        if (window.location.hostname.includes('github.com')) {
          activeFeatures[key] = initGitHubChatbotUI();
        }
        break;
      case 'learningAgent':
        activeFeatures[key] = initLearningAgentUI();
        break;
    }
  } else if (!value && activeFeatures[key]) {
    if (activeFeatures[key].cleanup) {
      activeFeatures[key].cleanup();
    }
    delete activeFeatures[key];
  }
}

function initializeFeatures() {
  Object.keys(currentToggles).forEach(key => {
    if (currentToggles[key]) {
      handleFeatureToggle(key, true);
    }
  });
}

// Load initial state - specifically load the 'toggles' object
browserAPI.storage.sync.get(['toggles'], (data) => {
  if (data.toggles) {
    currentToggles = data.toggles;
    initializeFeatures();
  }
});

// Listen for toggle changes
browserAPI.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.toggles) {
    const newToggles = changes.toggles.newValue || {};
    const oldToggles = changes.toggles.oldValue || {};
    
    currentToggles = newToggles;
    
    Object.keys(newToggles).forEach(key => {
      if (newToggles[key] !== oldToggles[key]) {
        handleFeatureToggle(key, newToggles[key]);
      }
    });
    
    Object.keys(oldToggles).forEach(key => {
      if (!(key in newToggles) && oldToggles[key]) {
        handleFeatureToggle(key, false);
      }
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
