// Content Script - Injected into all pages
import { initFontFinder } from './features/font-finder.js';
import { initColorFinder } from './features/color-finder.js';
import { initEditCookie } from './features/edit-cookie.js';
import { initCheckSEO } from './features/check-seo.js';
import { initFocusMode } from './features/focus-mode.js';
import { initFocusDetection } from './features/focus-detection.js';
import { initPassiveWatching } from './features/passive-watching.js';
import { initSpeedImprover } from './features/speed-improver.js';
import { initYouTubeAdBlock } from './features/youtube-adblock.js';
import { initGitHubNavigation } from './features/github-navigation.js';
import { initGitHubChatbotUI } from './features/github-chatbot-ui.js';
import { initLearningAgentUI } from './features/learning-agent-ui.js'; // Learning Agent with markdown support

// Cross-browser API compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

let activeFeatures = {};
let currentToggles = {};

// Global phone detection alert handler (always active)
function showPhoneDetectionAlert() {
  // Wait for body to exist
  if (!document.body) {
    console.log('Waiting for document.body to show alert...');
    setTimeout(showPhoneDetectionAlert, 100);
    return;
  }

  // Check if overlay already exists
  let overlay = document.getElementById('focus-detection-alert-overlay-global');
  if (overlay) {
    // Reset animation
    overlay.style.animation = 'none';
    setTimeout(() => {
      overlay.style.animation = 'fadeInOut 4s ease-in-out';
    }, 10);
    return;
  }

  // Create overlay
  overlay = document.createElement('div');
  overlay.id = 'focus-detection-alert-overlay-global';
  overlay.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
    color: white;
    padding: 32px 48px;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(239, 68, 68, 0.6);
    z-index: 999999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    text-align: center;
    border: 3px solid rgba(255, 255, 255, 0.3);
    animation: fadeInOut 4s ease-in-out;
    pointer-events: none;
  `;

  overlay.innerHTML = `
    <style>
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        15% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        85% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
      }
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
      }
    </style>
    <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: shake 0.5s ease-in-out;">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <div style="font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Phone Detected!</div>
      <div style="font-size: 18px; font-weight: 500; opacity: 0.95;">Focus back on your work 💪</div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Play alert sound
  try {
    const audioUrl = browserAPI.runtime.getURL('audio/alert.mp3');
    const alertAudio = new Audio(audioUrl);
    alertAudio.volume = 0.7;
    alertAudio.play().catch(() => {
      // Silent fail
    });
  } catch (error) {
    // Silent fail
  }

  // Remove overlay after animation
  setTimeout(() => {
    if (overlay && overlay.parentNode) {
      overlay.remove();
    }
  }, 4000);
}

// Load initial toggle state
browserAPI.storage.sync.get(['toggles'], (result) => {
  console.log('Loaded storage data:', result);
  if (result.toggles) {
    currentToggles = result.toggles;
    console.log('Current toggles:', currentToggles);
    initializeFeatures();
  } else {
    console.log('No toggles found in storage');
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
  console.log('📨 Content script received message:', message.type);
  
  // Global phone detection alert - works on all tabs
  if (message.type === 'PHONE_DETECTED') {
    console.log('📱 Phone detected alert received on this tab - showing alert!');
    showPhoneDetectionAlert();
    sendResponse({ success: true, received: true });
    return true;
  }

  if (message.type === 'TOGGLE_UPDATE') {
    console.log('Toggle update:', message.key, '=', message.value);
    currentToggles[message.key] = message.value;
    handleFeatureToggle(message.key, message.value);
    sendResponse({ success: true });
    return true;
  }
});

function initializeFeatures() {
  console.log('Initializing features with toggles:', currentToggles);
  Object.keys(currentToggles).forEach(key => {
    if (currentToggles[key]) {
      console.log('Initializing feature:', key);
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
    case 'focusMode':
      activeFeatures[feature] = initFocusMode();
      break;
    case 'focusDetection':
      activeFeatures[feature] = initFocusDetection();
      break;
    case 'passiveWatching':
      activeFeatures[feature] = initPassiveWatching();
      break;
    case 'speedImprover':
      activeFeatures[feature] = initSpeedImprover();
      break;
    case 'adBlocker':
      // YouTube-specific ad blocking
      activeFeatures[feature] = initYouTubeAdBlock();
      break;
    case 'githubAgent':
      // GitHub Agent with floating chatbot UI and navigation
      if (window.location.hostname.includes('github.com')) {
        activeFeatures[feature] = {
          chatbot: initGitHubChatbotUI(),
          navigation: initGitHubNavigation()
        };
      }
      break;
    case 'awsAgent':
      // Integration hook for AWS Agent
      if (window.location.hostname.includes('aws.amazon.com') || 
          window.location.hostname.includes('console.aws')) {
        console.log('AWS Agent integration point - ready for teammate implementation');
      }
      break;
    case 'learningAgent':
      // Learning Agent - Universal page content analyzer
      activeFeatures[feature] = initLearningAgentUI();
      break;
  }
}

console.log('Content script loaded');
