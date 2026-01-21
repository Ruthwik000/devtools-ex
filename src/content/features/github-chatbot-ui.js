// GitHub Chatbot UI - Floating, collapsible, movable window
// Updated to support markdown rendering for formatted responses
import { renderMarkdown, addMarkdownStyles } from './markdown-renderer.js';

export function initGitHubChatbotUI() {
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
        background: #238636;
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
        background: #2ea043;
      }

      .send-btn:disabled {
        background: #21262d;
        cursor: not-allowed;
        opacity: 0.5;
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
