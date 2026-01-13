// Simple Markdown Renderer for Chat Messages
// Converts markdown to HTML with proper formatting
// Added for Learning Agent & GitHub Agent markdown support

export function renderMarkdown(text) {
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
export function addMarkdownStyles() {
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
