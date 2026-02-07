import React, { useState, useEffect } from 'react';
import Section from '../components/Section';
import Toggle from '../components/Toggle';

const DeveloperTools = ({ expanded, onToggle, toggles, onToggleChange }) => {
  const [showGitHubAgent, setShowGitHubAgent] = useState(false);
  const [currentRepo, setCurrentRepo] = useState(null);

  useEffect(() => {
    if (expanded && toggles.githubAgent) {
      getCurrentTab();
    }
  }, [expanded, toggles.githubAgent]);

  const getCurrentTab = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.url) return;

      const repoInfo = extractGitHubInfo(tab.url);
      if (repoInfo) {
        setCurrentRepo(`${repoInfo.owner}/${repoInfo.repo}`);
        setShowGitHubAgent(true);
      } else {
        setShowGitHubAgent(false);
      }
    } catch (error) {
      console.error('Error getting current tab:', error);
      setShowGitHubAgent(false);
    }
  };

  const extractGitHubInfo = (url) => {
    const githubPattern = /github\.com\/([^\/]+)\/([^\/]+)/;
    const match = url.match(githubPattern);
    if (!match) return null;

    const owner = match[1];
    const repo = match[2].split('?')[0].replace(/\.git$/, '');

    return { owner, repo };
  };

  const openGroqConsole = () => {
    chrome.tabs.create({ url: 'https://console.groq.com' });
  };

  return (
    <Section title="Developer Tools" expanded={expanded} onToggle={onToggle}>
      <Toggle
        label="GitHub Agent"
        description="AI-powered repository assistant"
        enabled={toggles.githubAgent || false}
        onChange={(val) => onToggleChange('githubAgent', val)}
      />

      {/* GitHub File Tree is always active on GitHub - no toggle needed */}

      {/* GitHub Agent UI - Only show when enabled and on GitHub */}
      {toggles.githubAgent && showGitHubAgent && currentRepo && (
        <div className="mt-3 pt-3 border-t border-[#44444E] space-y-3">
          {/* Repository Info */}
          <div className="bg-[#44444E] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-gray-400" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8z"/>
              </svg>
              <span className="text-sm font-semibold text-gray-200">{currentRepo}</span>
            </div>
            <div className="text-xs text-gray-400 space-y-1">
              <p>✅ Floating chatbot is active on the page</p>
              <p>💬 Look for the chat window in the bottom-right corner</p>
            </div>
          </div>

          {/* Quick Info */}
          <div className="bg-[#6B5B95]/20 border border-[#6B5B95]/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <span className="text-[#9B8BC5] text-lg">💡</span>
              <div className="flex-1 text-xs text-[#C5B5E5]">
                <p className="font-semibold mb-1">How to use:</p>
                <ul className="space-y-1 ml-3 list-disc">
                  <li>Chat window appears on GitHub pages</li>
                  <li>Drag the header to move it around</li>
                  <li>Click minimize to collapse</li>
                  <li>Ask questions about the repository</li>
                </ul>
              </div>
            </div>
          </div>

          {/* API Key Setup */}
          <div className="bg-[#44444E] rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-2">
              Need a Groq API key? Get one for free:
            </p>
            <button
              onClick={openGroqConsole}
              className="w-full bg-[#555560] hover:bg-[#666670] text-gray-200 py-2 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
            >
              <span>🔑</span>
              <span>Get Free API Key</span>
            </button>
          </div>
        </div>
      )}

      {/* GitHub Agent enabled but not on GitHub */}
      {toggles.githubAgent && !showGitHubAgent && (
        <div className="mt-3 pt-3 border-t border-[#44444E] text-center py-4">
          <div className="text-3xl mb-2">📌</div>
          <p className="text-xs text-gray-400">
            Navigate to a GitHub repository to use this feature
          </p>
        </div>
      )}

      {/* Other Developer Tools */}
      <Toggle
        label="Auto Clear Cache"
        description="Automatically clear cache on page refresh"
        enabled={toggles.autoClearCache || false}
        onChange={(val) => onToggleChange('autoClearCache', val)}
      />
      
      <Toggle
        label="Edit Cookie"
        description="View and edit cookies on page"
        enabled={toggles.editCookie || false}
        onChange={(val) => onToggleChange('editCookie', val)}
      />
      
      <Toggle
        label="Check SEO"
        description="Analyze page SEO metrics"
        enabled={toggles.checkSEO || false}
        onChange={(val) => onToggleChange('checkSEO', val)}
      />
      
      <Toggle
        label="Font Finder"
        description="Hover to see font details"
        enabled={toggles.fontFinder || false}
        onChange={(val) => onToggleChange('fontFinder', val)}
      />
      
      <Toggle
        label="Color Finder"
        description="Pick colors from page"
        enabled={toggles.colorFinder || false}
        onChange={(val) => onToggleChange('colorFinder', val)}
      />

      <Toggle
        label="Learning Agent"
        description="AI assistant to answer questions about any page"
        enabled={toggles.learningAgent || false}
        onChange={(val) => onToggleChange('learningAgent', val)}
      />
    </Section>
  );
};

export default DeveloperTools;
