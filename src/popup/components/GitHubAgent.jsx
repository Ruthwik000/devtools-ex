import React, { useState, useEffect, useRef } from 'react';

const GitHubAgent = () => {
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    chrome.storage.local.get(['groqApiKey'], (result) => {
      if (result.groqApiKey) {
        setHasApiKey(true);
      }
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveApiKey = () => {
    if (apiKey.trim()) {
      chrome.storage.local.set({ groqApiKey: apiKey.trim() }, () => {
        setHasApiKey(true);
        setApiKey('');
      });
    }
  };

  const changeApiKey = () => {
    setHasApiKey(false);
    setMessages([]);
  };

  const sendQuery = async () => {
    if (!query.trim() || loading) return;

    const userQuery = query.trim();
    setQuery('');
    setMessages(prev => [...prev, { text: userQuery, type: 'user' }]);
    setLoading(true);

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: extractGitHubContent,
        world: 'MAIN'
      });

      const pageContent = result.result;
      const { groqApiKey } = await chrome.storage.local.get(['groqApiKey']);

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
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
              content: userQuery
            }
          ],
          temperature: 0.7,
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const answer = data.choices[0].message.content;

      setMessages(prev => [...prev, { text: answer, type: 'assistant' }]);

      await chrome.tabs.sendMessage(tab.id, {
        action: 'checkNavigation',
        query: userQuery,
        answer: answer,
        pageContent: pageContent
      }).catch(() => {});

    } catch (error) {
      setMessages(prev => [...prev, { text: `Error: ${error.message}`, type: 'error' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendQuery();
    }
  };

  if (!hasApiKey) {
    return (
      <div className="mt-3 pt-3 border-t border-gray-700 space-y-3">
        <div className="bg-gray-750 rounded-lg p-3 space-y-3">
          <label className="text-xs font-semibold text-gray-400 uppercase">Groq API Key</label>
          <input
            type="password"
            placeholder="Enter your Groq API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveApiKey()}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={saveApiKey}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
          >
            Save API Key
          </button>
          <p className="text-xs text-gray-400">
            Get your free API key from{' '}
            <a 
              href="https://console.groq.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              console.groq.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-700 space-y-3">
      <div className="bg-gray-750 rounded-lg p-3 space-y-3 max-h-80 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`p-2 rounded-lg text-sm ${
              msg.type === 'user' 
                ? 'bg-blue-600 text-white ml-4' 
                : msg.type === 'error'
                ? 'bg-red-900/50 text-red-200 mr-4'
                : 'bg-gray-800 text-gray-200 mr-4'
            }`}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="text-center text-sm text-gray-400 italic">
            Analyzing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="space-y-2">
        <textarea
          placeholder="Ask about this repository..."
          rows="3"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          className="w-full bg-gray-750 border border-gray-600 rounded-lg p-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
        />
        <div className="flex gap-2">
          <button
            onClick={sendQuery}
            disabled={loading || !query.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
          >
            Send
          </button>
          <button
            onClick={changeApiKey}
            className="bg-gray-700 hover:bg-gray-600 text-gray-200 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
          >
            Change Key
          </button>
        </div>
      </div>
    </div>
  );
};

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
      console.error('Failed to fetch raw content:', error);
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

export default GitHubAgent;
