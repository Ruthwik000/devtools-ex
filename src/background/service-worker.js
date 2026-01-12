// Background Service Worker
import { clearCache } from './handlers/cache-handler.js';
import { handleAdBlocker } from './handlers/adblock-handler.js';

// ============================================
// FOCUS DETECTION - State and Constants
// ============================================
let isDetecting = false;
let detectionInterval = null;
const API_KEY = 'dnJH9C8BFgg1vaBXQaz1';
const API_URL = 'https://serverless.roboflow.com/mobile-phone-detection-2vads/1';
const DETECTION_INTERVAL = 2000;

// Initialize on install/startup
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Extension installed/updated');

  // Load saved toggle states and apply them
  const result = await chrome.storage.sync.get(['toggles']);
  if (result.toggles && result.toggles.adBlocker) {
    await handleAdBlocker(true);
  }
});

// Also check on startup
chrome.runtime.onStartup.addListener(async () => {
  console.log('Browser started');

  // Load saved toggle states and apply them
  const result = await chrome.storage.sync.get(['toggles']);
  if (result.toggles && result.toggles.adBlocker) {
    await handleAdBlocker(true);
  }
});

// Listen for toggle changes
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Focus Detection Messages
  if (message.action === 'startDetection') {
    console.log('Background: Received startDetection');
    startDetection();
    sendResponse({ success: true, isDetecting: true });
    return true;
  }

  if (message.action === 'stopDetection') {
    console.log('Background: Received stopDetection');
    stopDetection();
    sendResponse({ success: true, isDetecting: false });
    return true;
  }

  if (message.action === 'getStatus') {
    sendResponse({ isDetecting });
    return true;
  }

  if (message.action === 'captureFrame') {
    // Forward to offscreen document
    chrome.runtime.sendMessage(message).then(sendResponse);
    return true;
  }

  // Other Messages
  if (message.type === 'TOGGLE_CHANGED') {
    handleToggleChange(message.key, message.value);
    sendResponse({ success: true });
  }

  if (message.type === 'CLEAR_CACHE') {
    clearCache().then(() => {
      sendResponse({ success: true });
    });
    return true; // Keep channel open for async response
  }

  // Nuclear Mode coordination
  if (message.type === 'NUCLEAR_MODE_CHECK') {
    chrome.storage.local.get(['nuclearMode'], (result) => {
      sendResponse({ nuclearMode: result.nuclearMode || null });
    });
    return true;
  }

  if (message.type === 'NUCLEAR_MODE_UPDATE') {
    chrome.storage.local.set({ nuclearMode: message.data }, () => {
      // Notify all tabs about Nuclear Mode change
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            type: 'NUCLEAR_MODE_UPDATED',
            data: message.data
          }).catch(() => { });
        });
      });
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'GET_COOKIES') {
    chrome.cookies.getAll({ url: message.url }, (cookies) => {
      sendResponse({ cookies });
    });
    return true;
  }

  if (message.type === 'SET_COOKIE') {
    const cookieDetails = {
      url: message.url,
      name: message.cookie.name,
      value: message.cookie.value,
      domain: message.cookie.domain,
      path: message.cookie.path || '/',
      secure: message.cookie.secure || false,
      httpOnly: message.cookie.httpOnly || false,
      sameSite: message.cookie.sameSite || 'no_restriction'
    };

    if (message.cookie.expirationDate) {
      cookieDetails.expirationDate = message.cookie.expirationDate;
    }

    chrome.cookies.set(cookieDetails, (cookie) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ success: true, cookie });
      }
    });
    return true;
  }

  if (message.type === 'REMOVE_COOKIE') {
    const url = message.url;
    const name = message.name;
    const domain = message.domain;

    chrome.cookies.remove({ url, name }, () => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ success: true });
      }
    });
    return true;
  }

  if (message.type === 'DELETE_ALL_COOKIES') {
    chrome.cookies.getAll({ url: message.url }, (cookies) => {
      let removed = 0;
      cookies.forEach(cookie => {
        chrome.cookies.remove({
          url: message.url,
          name: cookie.name
        }, () => {
          removed++;
          if (removed === cookies.length) {
            sendResponse({ success: true });
          }
        });
      });
      if (cookies.length === 0) {
        sendResponse({ success: true });
      }
    });
    return true;
  }

  // Handle Nuclear Mode updates from content scripts
  if (message.type === 'NUCLEAR_MODE_UPDATE') {
    console.log('☢️ Service Worker: Received NUCLEAR_MODE_UPDATE', message.data);

    // Broadcast to ALL tabs
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        // Skip restricted urls/chrome:// urls
        if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://')) return;

        chrome.tabs.sendMessage(tab.id, {
          type: 'NUCLEAR_MODE_UPDATED',
          data: message.data
        }).catch(err => {
          // Ignore errors for tabs that don't have the content script
          // console.log(`Could not send update to tab ${tab.id}:`, err);
        });
      });
    });

    sendResponse({ success: true });
    return true;
  }
});

// Handle toggle state changes
async function handleToggleChange(key, value) {
  console.log(`Toggle changed: ${key} = ${value}`);

  // Ad Blocker toggle
  if (key === 'adBlocker') {
    await handleAdBlocker(value);
  }

  // Notify all tabs about toggle change
  const tabs = await chrome.tabs.query({});
  tabs.forEach(tab => {
    chrome.tabs.sendMessage(tab.id, {
      type: 'TOGGLE_UPDATE',
      key,
      value
    }).catch(() => {
      // Tab might not have content script loaded
    });
  });
}

// Integration hooks for teammate agents
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // GitHub Agent Hook
  if (message.type === 'GITHUB_AGENT_ACTION') {
    // Placeholder: GitHub agent will implement this
    console.log('GitHub Agent hook triggered');
    sendResponse({ status: 'pending_integration' });
  }

  // AWS Agent Hook
  if (message.type === 'AWS_AGENT_ACTION') {
    // Placeholder: AWS agent will implement this
    console.log('AWS Agent hook triggered');
    sendResponse({ status: 'pending_integration' });
  }

  // Learning Agent Hook
  if (message.type === 'LEARNING_AGENT_ACTION') {
    // Placeholder: Learning agent will implement this
    console.log('Learning Agent hook triggered');
    sendResponse({ status: 'pending_integration' });
  }
});

console.log('Background service worker loaded');

// ============================================
// FOCUS DETECTION - Background Processing
// ============================================
async function startDetection() {
  if (isDetecting) return;

  console.log('Starting detection...');
  isDetecting = true;

  // Create offscreen document for camera
  try {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['USER_MEDIA'],
      justification: 'Camera access for mobile phone detection'
    });
  } catch (error) {
    if (!error.message.includes('Only a single offscreen')) {
      console.error('Error creating offscreen document:', error);
    }
  }

  // Wait for camera to initialize
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Start detection loop
  detectionInterval = setInterval(async () => {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'captureFrame' });
      if (response && response.imageData) {
        await detectMobilePhone(response.imageData);
      }
    } catch (error) {
      console.error('Detection loop error:', error);
    }
  }, DETECTION_INTERVAL);

  console.log('Focus detection started in background');
}

function stopDetection() {
  console.log('Stopping detection...');
  isDetecting = false;

  if (detectionInterval) {
    clearInterval(detectionInterval);
    detectionInterval = null;
  }

  chrome.offscreen.closeDocument().catch(() => { });

  console.log('Focus detection stopped');
}

async function detectMobilePhone(imageBase64) {
  try {
    const response = await fetch(`${API_URL}?api_key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: imageBase64
    });

    const data = await response.json();
    console.log('API Response:', data);

    if (data.predictions && data.predictions.length > 0) {
      // Show alert on active tab
      try {
        const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        if (tabs[0]) {
          await chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: () => {
              alert('⚠️ DISTRACTED! Mobile phone detected. Please stay focused!');
            }
          });
        }
      } catch (error) {
        console.error('Error showing alert:', error);
      }

      // Show notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        title: 'Focus Alert!',
        message: `${data.predictions.length} mobile phone(s) detected!`
      });

      // Notify popup if open
      chrome.runtime.sendMessage({
        action: 'detectionResult',
        predictions: data.predictions
      }).catch(() => { });
    }
  } catch (error) {
    console.error('Detection error:', error);
  }
}

// Nuclear Mode: Periodic timer check to auto-deactivate when time expires
setInterval(async () => {
  const result = await chrome.storage.local.get(['nuclearMode']);
  const nuclearMode = result.nuclearMode;

  if (nuclearMode && nuclearMode.isActive && nuclearMode.timerEndTime) {
    // Check if timer expired
    if (Date.now() >= nuclearMode.timerEndTime) {
      console.log('⏰ Nuclear Mode timer expired - auto-deactivating');

      // Deactivate Nuclear Mode
      await chrome.storage.local.set({
        nuclearMode: {
          whitelist: nuclearMode.whitelist || [],
          timerEndTime: null,
          isActive: false
        }
      });

      // Turn off the toggle
      await chrome.storage.sync.set({ passiveWatching: false });

      // Notify all tabs
      const tabs = await chrome.tabs.query({});
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'NUCLEAR_MODE_UPDATED',
          data: {
            whitelist: nuclearMode.whitelist || [],
            timerEndTime: null,
            isActive: false
          }
        }).catch(() => { });
      });

      console.log('✅ Nuclear Mode automatically deactivated');
    }
  }
}, 1000); // Check every second

// Nuclear Mode: Block new tabs that aren't whitelisted
chrome.tabs.onCreated.addListener(async (tab) => {
  const result = await chrome.storage.local.get(['nuclearMode']);
  const nuclearMode = result.nuclearMode;

  if (!nuclearMode || !nuclearMode.isActive || !nuclearMode.timerEndTime) {
    return;
  }

  // Check if timer expired
  if (Date.now() >= nuclearMode.timerEndTime) {
    return;
  }

  // Wait for the tab to load its URL
  setTimeout(async () => {
    try {
      const updatedTab = await chrome.tabs.get(tab.id).catch(() => null);
      if (!updatedTab || !updatedTab.url) return;

      // Skip special URLs
      if (updatedTab.url.startsWith('chrome://') ||
        updatedTab.url.startsWith('chrome-extension://') ||
        updatedTab.url.startsWith('about:') ||
        updatedTab.url.startsWith('data:') ||
        updatedTab.url === 'about:blank') {
        return;
      }

      const url = new URL(updatedTab.url);
      const domain = url.hostname.replace(/^www\./, '');

      // Check if domain is whitelisted
      const isWhitelisted = nuclearMode.whitelist.some(site => {
        const cleanSite = site.replace(/^https?:\/\//, '').replace(/^www\./, '');
        return domain.includes(cleanSite) || cleanSite.includes(domain);
      });

      // Close tab if not whitelisted
      if (!isWhitelisted) {
        chrome.tabs.remove(tab.id).catch(() => { });
      }
    } catch (error) {
      console.error('Error checking tab:', error);
    }
  }, 1000);
});

// Nuclear Mode: Block navigation to non-whitelisted sites
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return; // Only main frame

  const result = await chrome.storage.local.get(['nuclearMode']);
  const nuclearMode = result.nuclearMode;

  if (!nuclearMode || !nuclearMode.isActive || !nuclearMode.timerEndTime) {
    return;
  }

  // Check if timer expired
  if (Date.now() >= nuclearMode.timerEndTime) {
    return;
  }

  // Skip special URLs
  if (details.url.startsWith('chrome://') ||
    details.url.startsWith('chrome-extension://') ||
    details.url.startsWith('about:') ||
    details.url.startsWith('data:') ||
    details.url === 'about:blank') {
    return;
  }

  try {
    const url = new URL(details.url);
    const domain = url.hostname.replace(/^www\./, '');

    // Check if domain is whitelisted
    const isWhitelisted = nuclearMode.whitelist.some(site => {
      const cleanSite = site.replace(/^https?:\/\//, '').replace(/^www\./, '');
      return domain.includes(cleanSite) || cleanSite.includes(domain);
    });

    // Close tab if not whitelisted
    if (!isWhitelisted) {
      chrome.tabs.remove(details.tabId).catch(() => { });
    }
  } catch (error) {
    console.error('Error checking navigation:', error);
  }
});

