// Content Script - Injected into all pages
import { initFontFinder } from './features/font-finder.js';
import { initColorFinder } from './features/color-finder.js';
import { initEditCookie } from './features/edit-cookie.js';
import { initCheckSEO } from './features/check-seo.js';
import { initGitHubChatbotUI } from './features/github-chatbot-ui.js';
import { initLearningAgentUI } from './features/learning-agent-ui.js';

// Cross-browser API compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

let activeFeatures = {};
let currentToggles = {};

// Load initial toggle state
browserAPI.storage.sync.get(['toggles'], (result) => {
  if (result.toggles) {
    currentToggles = result.toggles;
    initializeFeatures();
  }
});

// Listen for storage changes
browserAPI.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.toggles) {
    const newToggles = changes.toggles.newValue || {};
    const oldToggles = changes.toggles.oldValue || {};
    
    currentToggles = newToggles;
    
    // Handle changed toggles
    Object.keys(newToggles).forEach(key => {
      if (newToggles[key] !== oldToggles[key]) {
        handleFeatureToggle(key, newToggles[key]);
      }
    });
    
    // Handle removed toggles
    Object.keys(oldToggles).forEach(key => {
      if (!(key in newToggles) && oldToggles[key]) {
        handleFeatureToggle(key, false);
      }
    });
  }
});

// Listen for toggle updates from background
browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TOGGLE_UPDATE') {
    currentToggles[message.key] = message.value;
    handleFeatureToggle(message.key, message.value);
    sendResponse({ success: true });
    return true;
  }
});

function initializeFeatures() {
  Object.keys(currentToggles).forEach(key => {
    if (currentToggles[key]) {
      handleFeatureToggle(key, true);
    }
  });
}

function handleFeatureToggle(feature, enabled) {
  // Clean up existing feature
  if (activeFeatures[feature]?.cleanup) {
    activeFeatures[feature].cleanup();
    delete activeFeatures[feature];
  }

  if (!enabled) return;

  // Initialize feature based on toggle
  switch (feature) {
    case 'fontFinder':
      activeFeatures[feature] = initFontFinder();
      break;
    case 'colorFinder':
      activeFeatures[feature] = initColorFinder();
      break;
    case 'editCookie':
      activeFeatures[feature] = initEditCookie();
      break;
    case 'checkSEO':
      activeFeatures[feature] = initCheckSEO();
      break;
    case 'githubAgent':
      // GitHub Agent with floating chatbot UI
      if (window.location.hostname.includes('github.com')) {
        activeFeatures[feature] = initGitHubChatbotUI();
      }
      break;
    case 'learningAgent':
      // Learning Agent - Universal page content analyzer
      activeFeatures[feature] = initLearningAgentUI();
      break;
  }
}
