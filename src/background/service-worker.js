// Background Service Worker
import { clearCache } from './handlers/cache-handler.js';

// Initialize on install/startup
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Extension installed/updated');
});

// Also check on startup
chrome.runtime.onStartup.addListener(async () => {
  console.log('Browser started');
});

// Listen for toggle changes
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
});

// Handle toggle state changes
async function handleToggleChange(key, value) {
  console.log(`Toggle changed: ${key} = ${value}`);

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

console.log('Background service worker loaded');
