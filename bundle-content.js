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
      case 'passiveWatching':
        activeFeatures[key] = initPassiveWatching();
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
`;

// Write the bundled file
const outputPath = path.join(__dirname, 'src', 'content', 'content-bundle.js');
fs.writeFileSync(outputPath, bundledContent);

console.log('✅ Content script bundled successfully!');
console.log(`   Output: ${outputPath}`);
