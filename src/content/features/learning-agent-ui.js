// Learning Agent UI - Universal page content analyzer
// Uses Groq API to answer questions about any webpage
// Includes markdown rendering for formatted responses
import { renderMarkdown, addMarkdownStyles } from './markdown-renderer.js';

export function initLearningAgentUI() {
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
