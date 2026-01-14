import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Bundling content scripts...');

// Read all feature files
const featuresDir = path.join(__dirname, 'src', 'content', 'features');
const featureFiles = [
  'nuclear-mode-blocker.js', // MUST BE FIRST - blocks sites immediately
  'markdown-renderer.js', // MUST BE EARLY - used by chat features
  'font-finder.js',
  'color-finder.js',
  'edit-cookie.js',
  'check-seo.js',
  'focus-mode.js',
  'focus-detection.js',
  'passive-watching.js',
  'energy-scheduling.js',
  'speed-improver.js',
  'youtube-adblock.js',
  'github-navigation.js',
  'github-chatbot-ui.js',
  'learning-agent-ui.js'
];

let bundledContent = `// Content Script Bundle - Auto-generated
// Cross-browser API compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

`;

// Read and append each feature file
featureFiles.forEach(file => {
  const filePath = path.join(featuresDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`  Adding ${file}...`);
    let content = fs.readFileSync(filePath, 'utf8');
    // Remove export statements
    content = content.replace(/export\s+/g, '');
    // Remove import statements (since everything is bundled) - Added for markdown renderer support
    content = content.replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '');
    bundledContent += `\n// ========== ${file} ==========\n`;
    bundledContent += content + '\n';
  } else {
    console.log(`  Skipping ${file} (not found)`);
  }
});

// Add the main initialization code
bundledContent += `
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
  console.log('Initializing features with toggles:', currentToggles);
  Object.keys(currentToggles).forEach(key => {
    if (currentToggles[key]) {
      console.log('Initializing feature:', key);
      handleFeatureToggle(key, true);
    }
  });
}

// Load initial state - specifically load the 'toggles' object
browserAPI.storage.sync.get(['toggles'], (data) => {
  console.log('Loaded storage data:', data);
  if (data.toggles) {
    currentToggles = data.toggles;
    console.log('Current toggles:', currentToggles);
    initializeFeatures();
  } else {
    console.log('No toggles found in storage');
  }
});

// Listen for toggle changes
browserAPI.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.toggles) {
    console.log('Storage changed - toggles:', changes.toggles);
    const newToggles = changes.toggles.newValue || {};
    const oldToggles = changes.toggles.oldValue || {};
    
    // Update current toggles
    currentToggles = newToggles;
    
    // Handle each changed toggle
    Object.keys(newToggles).forEach(key => {
      if (newToggles[key] !== oldToggles[key]) {
        console.log('Toggle changed:', key, '=', newToggles[key]);
        handleFeatureToggle(key, newToggles[key]);
      }
    });
    
    // Handle removed toggles
    Object.keys(oldToggles).forEach(key => {
      if (!(key in newToggles) && oldToggles[key]) {
        console.log('Toggle removed:', key);
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
`;

// Write the bundled file
const outputPath = path.join(__dirname, 'src', 'content', 'content-bundle.js');
fs.writeFileSync(outputPath, bundledContent);

console.log('✅ Content script bundled successfully!');
console.log(`   Output: ${outputPath}`);
