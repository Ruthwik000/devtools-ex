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
          <button class="chat-btn" id="learning-settings-btn" title="Settings">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
              <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319z"/>
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
          <textarea id="learning-chat-input" placeholder="Ask about this page..." rows="2"></textarea>
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
        background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
        border-bottom: 1px solid rgba(59, 130, 246, 0.3);
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

      #learning-agent-chatbot .chat-title svg {
        flex-shrink: 0;
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
        background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
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
        gap: 12px;
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
        border-radius: 10px;
        padding: 12px 16px;
        color: #E5E7EB;
        font-size: 14px;
        font-family: inherit;
        resize: vertical;
        outline: none;
        transition: all 0.2s;
        min-height: 44px;
        max-height: 120px;
        line-height: 1.5;
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
        background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
        border: none;
        border-radius: 10px;
        padding: 12px 16px;
        min-width: 56px;
        height: 44px;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        flex-shrink: 0;
      }

      #learning-agent-chatbot .send-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5);
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
      // Update the toggles object to turn off the feature
      chrome.storage.sync.get(['toggles'], (data) => {
        const toggles = data.toggles || {};
        toggles.learningAgent = false;
        chrome.storage.sync.set({ toggles });
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
