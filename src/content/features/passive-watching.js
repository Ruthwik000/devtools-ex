// Nuclear Mode - Website blocker with whitelist and timer
export function initPassiveWatching() {
  const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

  // Check if cleanup was just done (prevents re-initialization after toggle OFF)
  try {
    const cleanupDone = sessionStorage.getItem('nuclearModeCleanupDone');
    if (cleanupDone === 'true') {
      console.log('⚠️ Nuclear Mode: Cleanup was just done, skipping initialization');
      sessionStorage.removeItem('nuclearModeCleanupDone');
      return { cleanup: () => { } }; // Return empty cleanup function
    }
  } catch (e) {
    console.log('⚠️ Could not check sessionStorage:', e);
  }

  console.log('🚀 Nuclear Mode: Starting initialization...');

  // CRITICAL: Listen for toggle being turned OFF directly from sync storage
  browserAPI.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.passiveWatching) {
      const newValue = changes.passiveWatching.newValue;
      const oldValue = changes.passiveWatching.oldValue;

      console.log('🔄 passiveWatching changed:', oldValue, '->', newValue);

      if (oldValue === true && newValue === false) {
        console.log('🛑 TOGGLE TURNED OFF - FORCE CLEARING STORAGE');

        // FORCE clear storage immediately
        browserAPI.storage.local.set({
          nuclearMode: {
            whitelist: [],
            timerEndTime: null,
            isActive: false
          }
        }, () => {
          console.log('✅ Storage cleared! Reloading in 500ms...');
          sessionStorage.setItem('nuclearModeCleanupDone', 'true');
          setTimeout(() => {
            window.location.reload();
          }, 500);
        });
      }
    }
  });

  // Variables for Nuclear Mode state
  let panel = null;
  let whitelist = [];
  let timerEndTime = null;
  let timerInterval = null;
  let isActive = false;
  let isContextValid = true;
  let floatingTimer = null;

  // Normalize URL by removing 'www.' from the beginning
  function normalizeURL(url) {
    return url.replace(/^www\./i, "");
  }

  // Check if the current website should be blocked
  function shouldBlockWebsite(whitelistSet) {
    const currentHostname = normalizeURL(window.location.hostname);
    console.log('🔍 Checking if should block:', currentHostname);
    console.log('🔍 Whitelist:', whitelistSet);

    // Check if current site is in whitelist
    const isWhitelisted = whitelistSet.some(site => {
      const normalizedSite = normalizeURL(site);
      const matches = currentHostname === normalizedSite || currentHostname.includes(normalizedSite);
      console.log(`  Comparing ${currentHostname} with ${normalizedSite}: ${matches}`);
      return matches;
    });

    console.log('🔍 Is whitelisted:', isWhitelisted);
    return !isWhitelisted; // Block if NOT whitelisted
  }

  // Create the blocked page (EXACT same approach as reference)
  function createBlockedPage(endTime, wl) {
    console.log('🔒 BLOCKING PAGE NOW!');
    const blockedPage = generateBlockedPageHTML(endTime, wl);
    const style = generateBlockedPageStyle();

    // Inject the styles and blocked page into the current document
    const head = document.head || document.getElementsByTagName("head")[0];
    head.insertAdjacentHTML("beforeend", style);
    document.body.innerHTML = blockedPage;

    // Update timer every second
    setInterval(() => {
      const remaining = Math.ceil((endTime - Date.now()) / 1000 / 60);
      const timerEl = document.getElementById('block-timer-value');
      if (timerEl) {
        if (remaining > 0) {
          timerEl.textContent = `${remaining} min`;
        } else {
          timerEl.textContent = 'Done!';
          window.location.reload();
        }
      }
    }, 1000);
  }

  // Check if the website should be blocked and take appropriate action
  function check_if_restricted(nuclearMode) {
    console.log('🔍 check_if_restricted called');
    console.log('🔍 Nuclear Mode data:', nuclearMode);

    if (!nuclearMode || !nuclearMode.isActive || !nuclearMode.timerEndTime) {
      console.log('❌ Nuclear Mode not active or no timer');
      return false;
    }

    // Check if timer hasn't expired
    if (Date.now() >= nuclearMode.timerEndTime) {
      console.log('❌ Timer expired');
      return false;
    }

    const whitelistSet = nuclearMode.whitelist || [];

    if (shouldBlockWebsite(whitelistSet)) {
      console.log('🔒 SHOULD BLOCK - Creating blocked page');
      createBlockedPage(nuclearMode.timerEndTime, whitelistSet);
      return true;
    }

    console.log('✅ Site is whitelisted - allowing access');
    return false;
  }

  // ============================================
  // IMMEDIATE BLOCKING CHECK (EXACT same as reference site blocker)
  // ============================================

  // Retrieve Nuclear Mode data from storage and block if needed
  browserAPI.storage.local.get("nuclearMode", function (data) {
    console.log('📦 Storage data retrieved:', data);
    const nuclearMode = data.nuclearMode || null;

    if (nuclearMode && nuclearMode.isActive && nuclearMode.timerEndTime) {
      console.log('✅ Nuclear Mode is active with timer');

      // Check if timer hasn't expired
      if (Date.now() < nuclearMode.timerEndTime) {
        console.log('✅ Timer is still valid');

        // Call check function (EXACT same pattern as reference)
        const wasBlocked = check_if_restricted(nuclearMode);

        if (wasBlocked) {
          console.log('🔒 Page was blocked - stopping here');
          return; // Stop here, don't initialize panel
        }

        // Site is whitelisted, show floating timer
        console.log('✅ Site whitelisted - showing floating timer');
        whitelist = nuclearMode.whitelist || [];
        timerEndTime = nuclearMode.timerEndTime;
        isActive = true;

        // Create floating timer on whitelisted sites
        setTimeout(() => {
          createFloatingTimer();
          startTimer();
        }, 1000);
      } else {
        console.log('❌ Timer expired');
      }
    } else {
      console.log('❌ Nuclear Mode not active or no data');
    }

    // Continue with normal initialization (panel creation)
    initializePanel();
  });

  function generateBlockedPageStyle() {
    return `
      <style>
        * {
          user-select: none !important;
          pointer-events: none !important;
          margin: 0 !important;
          padding: 0 !important;
          box-sizing: border-box !important;
        }

        body {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          height: 100vh !important;
          background: linear-gradient(135deg, #1F2937 0%, #111827 100%) !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
          overflow: hidden !important;
        }

        #nuclear-block-container {
          display: block !important;
          color: #fff !important;
          text-align: center !important;
          max-width: 600px !important;
          padding: 40px !important;
          pointer-events: auto !important;
        }

        .block-icon {
          font-size: 96px !important;
          margin-bottom: 32px !important;
          animation: pulse 2s infinite !important;
        }

        .block-title {
          font-size: 48px !important;
          font-weight: 700 !important;
          color: #F9FAFB !important;
          margin: 0 0 24px 0 !important;
        }

        .block-subtitle {
          font-size: 20px !important;
          color: #9CA3AF !important;
          margin-bottom: 40px !important;
          line-height: 1.6 !important;
        }

        .timer-box {
          background: rgba(239, 68, 68, 0.1) !important;
          border: 2px solid #EF4444 !important;
          padding: 32px !important;
          border-radius: 20px !important;
          margin-bottom: 32px !important;
        }

        .timer-label {
          font-size: 14px !important;
          color: #FCA5A5 !important;
          margin-bottom: 16px !important;
          text-transform: uppercase !important;
          letter-spacing: 2px !important;
          font-weight: 700 !important;
        }

        .timer-value {
          font-size: 72px !important;
          font-weight: 700 !important;
          color: #EF4444 !important;
          font-family: 'Courier New', monospace !important;
        }

        .whitelist-box {
          background: rgba(255,255,255,0.05) !important;
          border: 1px solid #374151 !important;
          border-radius: 16px !important;
          padding: 24px !important;
          margin-bottom: 24px !important;
        }

        .whitelist-title {
          font-size: 16px !important;
          color: #D1D5DB !important;
          margin-bottom: 16px !important;
          font-weight: 600 !important;
        }

        .whitelist-item {
          font-size: 15px !important;
          color: #9CA3AF !important;
          line-height: 2 !important;
          padding: 8px 0 !important;
        }

        .warning-box {
          background: rgba(239, 68, 68, 0.1) !important;
          border: 1px solid #EF4444 !important;
          border-radius: 12px !important;
          padding: 20px !important;
          margin-bottom: 24px !important;
        }

        .warning-text {
          font-size: 16px !important;
          color: #FCA5A5 !important;
          margin: 0 !important;
          font-weight: 600 !important;
        }

        .footer-text {
          font-size: 14px !important;
          color: #6B7280 !important;
        }

        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 1;
          }
          50% { 
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
      </style>
    `;
  }

  function generateBlockedPageHTML(endTime, wl) {
    const timeLeft = Math.ceil((endTime - Date.now()) / 1000 / 60);
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nuclear Mode - Site Blocked</title>
      </head>
      <body>
        <div id="nuclear-block-container">
          <div class="block-icon">🔒</div>
          <h1 class="block-title">Nuclear Mode Active</h1>
          <p class="block-subtitle">
            This website is blocked. You can only access whitelisted sites during your focus session.
          </p>
          
          <div class="timer-box">
            <div class="timer-label">Time Remaining</div>
            <div id="block-timer-value" class="timer-value">${timeLeft} min</div>
          </div>

          <div class="whitelist-box">
            <div class="whitelist-title">✓ Whitelisted Sites</div>
            ${wl.map(site => `<div class="whitelist-item">• ${site}</div>`).join('')}
          </div>

          <div class="warning-box">
            <p class="warning-text">⚠️ Timer cannot be stopped. Stay focused!</p>
          </div>

          <p class="footer-text">
            Navigate to a whitelisted site to continue working.
          </p>
        </div>
      </body>
      </html>
    `;
  }

  // ============================================
  // PANEL INITIALIZATION (Your existing UI - unchanged)
  // ============================================

  function initializePanel() {
    // Check if extension context is valid
    function checkContext() {
      try {
        if (!browserAPI.runtime?.id) {
          isContextValid = false;
          cleanup();
          return false;
        }
        return true;
      } catch (e) {
        isContextValid = false;
        cleanup();
        return false;
      }
    }

    // Safe storage get
    function safeStorageGet(keys) {
      return new Promise((resolve) => {
        if (!checkContext()) {
          resolve({});
          return;
        }
        try {
          browserAPI.storage.local.get(keys, (result) => {
            if (browserAPI.runtime.lastError) {
              console.error('Storage get error:', browserAPI.runtime.lastError);
              resolve({});
            } else {
              resolve(result);
            }
          });
        } catch (e) {
          console.error('Storage get exception:', e);
          resolve({});
        }
      });
    }

    // Safe storage set
    function safeStorageSet(data) {
      return new Promise((resolve) => {
        if (!checkContext()) {
          resolve(false);
          return;
        }
        try {
          browserAPI.storage.local.set(data, () => {
            if (browserAPI.runtime.lastError) {
              console.error('Storage set error:', browserAPI.runtime.lastError);
              resolve(false);
            } else {
              resolve(true);
            }
          });
        } catch (e) {
          console.error('Storage set exception:', e);
          resolve(false);
        }
      });
    }

    // Safe message send
    function safeSendMessage(message) {
      return new Promise((resolve) => {
        if (!checkContext()) {
          resolve(false);
          return;
        }
        try {
          browserAPI.runtime.sendMessage(message, (response) => {
            if (browserAPI.runtime.lastError) {
              console.error('Message send error:', browserAPI.runtime.lastError);
              resolve(false);
            } else {
              resolve(true);
            }
          });
        } catch (e) {
          console.error('Message send exception:', e);
          resolve(false);
        }
      });
    }

    // Load saved settings (for panel updates)
    safeStorageGet(['nuclearMode']).then((result) => {
      if (!checkContext()) return;

      if (result.nuclearMode) {
        whitelist = result.nuclearMode.whitelist || [];
        timerEndTime = result.nuclearMode.timerEndTime || null;
        isActive = result.nuclearMode.isActive || false;

        console.log('Loaded from storage - isActive:', isActive, 'timerEndTime:', timerEndTime, 'whitelist:', whitelist);

        // Update the UI with the loaded whitelist
        if (panel) {
          updateWhitelistDisplay();
        }

        if (isActive && timerEndTime) {
          // Check if timer expired
          if (Date.now() > timerEndTime) {
            deactivateNuclearMode();
            return;
          }

          // Check if current site is whitelisted
          const currentDomain = window.location.hostname.replace(/^www\./, '');
          const isWhitelisted = whitelist.some(site => {
            const cleanSite = site.replace(/^https?:\/\//, '').replace(/^www\./, '');
            return currentDomain.includes(cleanSite) || cleanSite.includes(currentDomain);
          });

          if (isWhitelisted) {
            // Site is whitelisted - show floating timer
            console.log('✅ This tab is whitelisted - showing floating timer on load');
            if (!floatingTimer) {
              createFloatingTimer();
            }
            startTimer();
          } else {
            // Site is NOT whitelisted - block it
            console.log('🔒 This tab is NOT whitelisted - blocking on load');
            checkAndBlockSite();
          }
        }
      }
    });

    // Listen for updates from other tabs
    browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (!checkContext()) return;

      if (message.type === 'NUCLEAR_MODE_UPDATED') {
        whitelist = message.data.whitelist || [];
        timerEndTime = message.data.timerEndTime || null;
        isActive = message.data.isActive || false;

        if (isActive && timerEndTime) {
          // Check if current site is whitelisted FIRST
          const currentDomain = window.location.hostname.replace(/^www\./, '');
          const isWhitelisted = whitelist.some(site => {
            const cleanSite = site.replace(/^https?:\/\//, '').replace(/^www\./, '');
            return currentDomain.includes(cleanSite) || cleanSite.includes(currentDomain);
          });

          if (isWhitelisted) {
            // Site is whitelisted - show floating timer
            console.log('✅ This tab is whitelisted - showing floating timer');
            if (!floatingTimer) {
              createFloatingTimer();
            }
            if (!timerInterval) {
              startTimer();
            }
          } else {
            // Site is NOT whitelisted - block it
            console.log('🔒 This tab is NOT whitelisted - will be blocked');
            checkAndBlockSite();
          }
        } else if (isActive === false && message.data.timerEndTime) {
          // Timer was set but not activated yet - just update the values
          console.log('Timer updated but not activated yet');
        } else if (!isActive) {
          // Nuclear mode was deactivated
          deactivateNuclearMode();
        }
      }
    });

    // Save settings and notify other tabs
    async function saveSettings() {
      if (!checkContext()) return;

      console.log('=== saveSettings called ===');
      const data = {
        whitelist,
        timerEndTime,
        isActive
      };
      console.log('Saving data:', JSON.stringify(data));

      const saved = await safeStorageSet({ nuclearMode: data });
      if (saved) {
        console.log('Data saved to storage');
      } else {
        console.error('Failed to save data');
      }

      // Notify background to update all tabs
      const sent = await safeSendMessage({
        type: 'NUCLEAR_MODE_UPDATE',
        data: data
      });

      if (sent) {
        console.log('Notified background of update');
      } else {
        console.error('Failed to notify background');
      }
    }

    // Check if current site is blocked
    function checkAndBlockSite() {
      console.log('=== checkAndBlockSite called ===');
      console.log('isActive:', isActive);
      console.log('timerEndTime:', timerEndTime);

      if (!checkContext()) return;
      if (!isActive || !timerEndTime) {
        console.log('Not active or no timer, skipping block check');
        return;
      }

      const now = Date.now();
      if (now > timerEndTime) {
        // Timer expired
        console.log('Timer expired, deactivating');
        deactivateNuclearMode();
        return;
      }

      const currentDomain = window.location.hostname;
      console.log('Current domain:', currentDomain);
      console.log('Whitelist:', JSON.stringify(whitelist));

      const isWhitelisted = whitelist.some(site => {
        const cleanSite = site.replace(/^https?:\/\//, '').replace(/^www\./, '');
        const cleanCurrent = currentDomain.replace(/^www\./, '');
        const matches = cleanCurrent.includes(cleanSite) || cleanSite.includes(cleanCurrent);
        console.log(`Checking ${cleanSite} against ${cleanCurrent}: ${matches}`);
        return matches;
      });

      console.log('Is whitelisted:', isWhitelisted);

      if (!isWhitelisted) {
        console.log('BLOCKING SITE!');
        blockSiteCompletely();
      } else {
        console.log('Site is whitelisted, allowing access');
      }

      // Add warning before closing browser/tab
      enableCloseWarning();
    }

    // Completely block the site (inspired by reference site blocker)
    function blockSiteCompletely() {
      if (!checkContext()) return;

      console.log('blockSiteCompletely called - clearing page');

      // Stop page loading
      try {
        window.stop();
      } catch (e) {
        console.log('Could not stop page loading:', e);
      }

      // Remove all content from HTML
      const html = document.querySelector("html");
      if (!html) {
        console.error('HTML element not found!');
        return;
      }

      html.innerHTML = "";

      // Add custom CSS
      const style = document.createElement("style");
      style.innerHTML = `
      @import url("https://fonts.googleapis.com/css?family=Aboreto");
      @import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.9.1/font/bootstrap-icons.css");

      * {
        user-select: none !important;
        pointer-events: none !important;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      html {
        background: linear-gradient(135deg, #1F2937 0%, #111827 100%) !important;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      body {
        width: 100%;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      #nuclear-block-container {
        display: block !important;
        color: #fff;
        text-align: center;
        max-width: 600px;
        padding: 40px;
        z-index: 999999999999;
        pointer-events: auto !important;
      }

      .block-icon {
        font-size: 96px;
        margin-bottom: 32px;
        animation: pulse 2s infinite;
      }

      .block-title {
        font-size: 48px;
        font-weight: 700;
        color: #F9FAFB;
        margin: 0 0 24px 0;
      }

      .block-subtitle {
        font-size: 20px;
        color: #9CA3AF;
        margin-bottom: 40px;
        line-height: 1.6;
      }

      .timer-box {
        background: rgba(239, 68, 68, 0.1);
        border: 2px solid #EF4444;
        padding: 32px;
        border-radius: 20px;
        margin-bottom: 32px;
      }

      .timer-label {
        font-size: 14px;
        color: #FCA5A5;
        margin-bottom: 16px;
        text-transform: uppercase;
        letter-spacing: 2px;
        font-weight: 700;
      }

      .timer-value {
        font-size: 72px;
        font-weight: 700;
        color: #EF4444;
        font-family: 'Courier New', monospace;
      }

      .whitelist-box {
        background: rgba(255,255,255,0.05);
        border: 1px solid #374151;
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 24px;
      }

      .whitelist-title {
        font-size: 16px;
        color: #D1D5DB;
        margin-bottom: 16px;
        font-weight: 600;
      }

      .whitelist-item {
        font-size: 15px;
        color: #9CA3AF;
        line-height: 2;
        padding: 8px 0;
      }

      .warning-box {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid #EF4444;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 24px;
      }

      .warning-text {
        font-size: 16px;
        color: #FCA5A5;
        margin: 0;
        font-weight: 600;
      }

      .footer-text {
        font-size: 14px;
        color: #6B7280;
      }

      @keyframes pulse {
        0%, 100% { 
          transform: scale(1);
          opacity: 1;
        }
        50% { 
          transform: scale(1.1);
          opacity: 0.8;
        }
      }
    `;
      html.appendChild(style);

      // Create block container
      const timeLeft = Math.ceil((timerEndTime - Date.now()) / 1000 / 60);
      const container = document.createElement("div");
      container.id = "nuclear-block-container";
      container.innerHTML = `
      <div class="block-icon">🔒</div>
      <h1 class="block-title">Nuclear Mode Active</h1>
      <p class="block-subtitle">
        This website is blocked. You can only access whitelisted sites during your focus session.
      </p>
      
      <div class="timer-box">
        <div class="timer-label">Time Remaining</div>
        <div id="block-timer-value" class="timer-value">${timeLeft} min</div>
      </div>

      <div class="whitelist-box">
        <div class="whitelist-title">✓ Whitelisted Sites</div>
        ${whitelist.map(site => `<div class="whitelist-item">• ${site}</div>`).join('')}
      </div>

      <div class="warning-box">
        <p class="warning-text">⚠️ Timer cannot be stopped. Stay focused!</p>
      </div>

      <p class="footer-text">
        Navigate to a whitelisted site to continue working.
      </p>
    `;

      html.appendChild(container);

      console.log('Block screen created and displayed');

      // Update timer every second
      const updateTimer = setInterval(() => {
        if (!checkContext()) {
          clearInterval(updateTimer);
          return;
        }

        const remaining = Math.ceil((timerEndTime - Date.now()) / 1000 / 60);
        const timerEl = document.getElementById('block-timer-value');
        if (timerEl) {
          if (remaining > 0) {
            timerEl.textContent = `${remaining} min`;
          } else {
            timerEl.textContent = 'Done!';
            clearInterval(updateTimer);
            // Reload to deactivate
            window.location.reload();
          }
        }
      }, 1000);

      // Prevent all escape attempts
      document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }, true);

      document.addEventListener('keydown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }, true);

      // Prevent navigation
      window.addEventListener('beforeunload', (e) => {
        e.preventDefault();
        e.returnValue = '';
        return '';
      });
    }

    // Prevent closing browser/tab with warning
    function enableCloseWarning() {
      if (!checkContext()) return;
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    function disableCloseWarning() {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    }

    function handleBeforeUnload(e) {
      if (!checkContext()) return;
      if (!isActive || !timerEndTime) return;

      const timeLeft = Math.ceil((timerEndTime - Date.now()) / 1000 / 60);
      if (timeLeft > 0) {
        const message = `Nuclear Mode is active! ${timeLeft} minutes remaining. Are you sure you want to quit?`;
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    }





    // Create control panel
    function createPanel() {
      panel = document.createElement('div');
      panel.id = 'nuclear-mode-panel';
      panel.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 480px; min-height: 400px; background: linear-gradient(135deg, #1F2937 0%, #111827 100%);
      border-radius: 16px; border: 1px solid #374151; box-shadow: 0 20px 60px rgba(0,0,0,0.6);
      z-index: 9999999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #E5E7EB; overflow: hidden; display: flex; flex-direction: column;
      resize: both; min-width: 400px; min-height: 350px;
    `;

      const currentDomain = window.location.hostname.replace(/^www\./, '');

      panel.innerHTML = `
      <div id="panel-header" style="background: linear-gradient(135deg, #374151 0%, #1F2937 100%); padding: 16px 20px; cursor: move; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #374151; user-select: none;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: #F9FAFB;">Nuclear Mode</h2>
        </div>
        <button id="close-panel" style="background: transparent; border: none; color: #9CA3AF; cursor: pointer; font-size: 24px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 6px; transition: all 0.2s;">×</button>
      </div>

      <div style="padding: 20px; flex: 1; overflow-y: auto;">
        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 14px; font-weight: 600; color: #D1D5DB; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">Whitelist</h3>
          <div style="display: flex; gap: 8px; margin-bottom: 12px;">
            <input type="text" id="whitelist-input" placeholder="example.com" style="flex: 1; background: rgba(255,255,255,0.05); border: 1px solid #374151; border-radius: 8px; padding: 10px 14px; color: #E5E7EB; font-size: 14px; outline: none;">
            <button id="add-whitelist" style="background: #3B82F6; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.2s;">Add</button>
          </div>
          <button id="add-current-site" style="width: 100%; background: rgba(59, 130, 246, 0.1); color: #60A5FA; border: 1px solid #3B82F6; padding: 10px; border-radius: 8px; cursor: pointer; font-size: 13px; margin-bottom: 12px; transition: all 0.2s;">
            Add Current Site (${currentDomain})
          </button>
          <div id="whitelist-container" style="display: flex; flex-direction: column; gap: 8px; max-height: 200px; overflow-y: auto;">
            ${whitelist.length === 0 ? '<div style="text-align: center; padding: 20px; color: #6B7280; font-size: 14px;">No whitelisted sites yet</div>' : ''}
          </div>
        </div>

        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 14px; font-weight: 600; color: #D1D5DB; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">Timer</h3>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 12px;">
            <button class="timer-preset" data-minutes="15" style="background: rgba(255,255,255,0.05); border: 1px solid #374151; color: #E5E7EB; padding: 12px; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.2s;">15m</button>
            <button class="timer-preset" data-minutes="30" style="background: rgba(255,255,255,0.05); border: 1px solid #374151; color: #E5E7EB; padding: 12px; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.2s;">30m</button>
            <button class="timer-preset" data-minutes="60" style="background: rgba(255,255,255,0.05); border: 1px solid #374151; color: #E5E7EB; padding: 12px; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.2s;">1h</button>
            <button class="timer-preset" data-minutes="120" style="background: rgba(255,255,255,0.05); border: 1px solid #374151; color: #E5E7EB; padding: 12px; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.2s;">2h</button>
          </div>
          <div style="display: flex; gap: 8px;">
            <input type="number" id="custom-minutes" placeholder="Custom minutes" min="1" max="480" style="flex: 1; background: rgba(255,255,255,0.05); border: 1px solid #374151; border-radius: 8px; padding: 10px 14px; color: #E5E7EB; font-size: 14px; outline: none;">
            <button id="set-custom-timer" style="background: rgba(255,255,255,0.05); border: 1px solid #374151; color: #E5E7EB; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.2s;">Set</button>
          </div>
        </div>

        <button id="activate-nuclear" style="width: 100%; background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; border: none; padding: 14px; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4); transition: all 0.2s;">
          Activate Nuclear Mode
        </button>

        <button id="deactivate-nuclear" style="width: 100%; background: rgba(255,255,255,0.05); color: #9CA3AF; border: 1px solid #374151; padding: 14px; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; margin-top: 12px; display: none; transition: all 0.2s;">
          Stop Nuclear Mode
        </button>
      </div>

      <div id="resize-handle" style="position: absolute; bottom: 0; right: 0; width: 20px; height: 20px; cursor: nwse-resize; background: linear-gradient(135deg, transparent 50%, #374151 50%); border-radius: 0 0 16px 0;"></div>
    `;

      document.body.appendChild(panel);
      updateWhitelistDisplay();
      attachEventListeners();
      makeDraggable();
      makeResizable();

      if (isActive && timerEndTime) {
        showActiveState();
      }
    }

    // Update whitelist display
    function updateWhitelistDisplay() {
      console.log('=== updateWhitelistDisplay called ===');
      console.log('Current whitelist:', JSON.stringify(whitelist));

      const container = document.querySelector('#nuclear-mode-panel #whitelist-container');

      if (!container) {
        console.error('Whitelist container not found');
        return;
      }

      console.log('Container found');

      if (whitelist.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: #6B7280; font-size: 14px;">No whitelisted sites yet</div>';
        console.log('Showing empty state');
        return;
      }

      container.innerHTML = whitelist.map((site, index) => `
      <div class="whitelist-item" style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.05); border: 1px solid #374151; border-radius: 8px; padding: 10px 14px; transition: all 0.2s;">
        <span style="color: #E5E7EB; font-size: 14px;">${site}</span>
        <button class="remove-whitelist" data-index="${index}" style="background: rgba(239, 68, 68, 0.1); color: #EF4444; border: none; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 12px; transition: all 0.2s;">Remove</button>
      </div>
    `).join('');

      console.log('Whitelist HTML updated with', whitelist.length, 'items');

      // Add remove handlers
      const removeButtons = container.querySelectorAll('.remove-whitelist');
      console.log('Found', removeButtons.length, 'remove buttons');

      removeButtons.forEach(btn => {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();

          const index = parseInt(this.dataset.index);
          console.log('=== Remove clicked for index:', index, '===');
          console.log('Site to remove:', whitelist[index]);
          console.log('Whitelist before remove:', JSON.stringify(whitelist));

          if (index >= 0 && index < whitelist.length) {
            whitelist.splice(index, 1);
            console.log('Whitelist after remove:', JSON.stringify(whitelist));
            saveSettings();
            updateWhitelistDisplay();
          } else {
            console.error('Invalid index:', index);
          }
        });

        btn.addEventListener('mouseenter', function () {
          this.style.background = '#EF4444';
          this.style.color = 'white';
        });

        btn.addEventListener('mouseleave', function () {
          this.style.background = 'rgba(239, 68, 68, 0.1)';
          this.style.color = '#EF4444';
        });
      });

      console.log('Remove handlers attached to all buttons');
    }

    // Attach event listeners
    function attachEventListeners() {
      if (!panel) {
        console.error('Panel not found in attachEventListeners');
        return;
      }

      if (!checkContext()) {
        console.error('Extension context invalid');
        return;
      }

      console.log('attachEventListeners called');

      // Close button
      const closeBtn = panel.querySelector('#close-panel');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          panel.remove();
          if (checkContext()) {
            safeStorageSet({ passiveWatching: false });
          }
        });

        closeBtn.addEventListener('mouseenter', function () {
          this.style.background = 'rgba(239, 68, 68, 0.1)';
          this.style.color = '#EF4444';
        });
        closeBtn.addEventListener('mouseleave', function () {
          this.style.background = 'transparent';
          this.style.color = '#9CA3AF';
        });
      }

      // Add whitelist function
      const addWhitelist = () => {
        if (!checkContext()) {
          console.log('Extension context invalid');
          return;
        }

        console.log('=== Add whitelist clicked ===');
        const input = document.querySelector('#nuclear-mode-panel #whitelist-input');

        if (!input) {
          console.error('Input element not found');
          return;
        }

        const rawValue = input.value.trim();
        console.log('Raw input value:', rawValue);

        if (!rawValue) {
          console.log('Empty input');
          alert('Please enter a website domain (e.g., google.com)');
          return;
        }

        // Clean the site URL
        let site = rawValue
          .replace(/^https?:\/\//, '')  // Remove protocol
          .replace(/^www\./, '')         // Remove www
          .replace(/\/.*$/, '');         // Remove path

        console.log('Cleaned site:', site);
        console.log('Current whitelist:', JSON.stringify(whitelist));

        if (whitelist.includes(site)) {
          console.log('Site already in whitelist');
          alert('This site is already in the whitelist!');
          return;
        }

        // Add to whitelist
        whitelist.push(site);
        console.log('Added to whitelist. New whitelist:', JSON.stringify(whitelist));

        // Save and update
        saveSettings();
        updateWhitelistDisplay();
        input.value = '';

        console.log('Whitelist add complete');
      };

      // Add button click
      const addBtn = panel.querySelector('#add-whitelist');
      if (addBtn) {
        console.log('Add button found, attaching listener');
        addBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          addWhitelist();
        });
      } else {
        console.error('Add button not found');
      }

      // Input enter key
      const whitelistInput = panel.querySelector('#whitelist-input');
      if (whitelistInput) {
        console.log('Input found, attaching keypress listener');
        whitelistInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            console.log('Enter key pressed');
            addWhitelist();
          }
        });
      } else {
        console.error('Whitelist input not found');
      }

      // Add current site button
      const addCurrentBtn = panel.querySelector('#add-current-site');
      if (addCurrentBtn) {
        console.log('Add current site button found');
        addCurrentBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();

          if (!checkContext()) {
            alert('Extension context invalid. Please reload the page.');
            return;
          }

          console.log('=== Add current site clicked ===');

          const currentDomain = window.location.hostname.replace(/^www\./, '');
          console.log('Current domain:', currentDomain);
          console.log('Current whitelist:', JSON.stringify(whitelist));

          if (whitelist.includes(currentDomain)) {
            console.log('Current site already in whitelist');
            alert('This site is already in the whitelist!');
            return;
          }

          whitelist.push(currentDomain);
          console.log('Added current site. New whitelist:', JSON.stringify(whitelist));

          saveSettings();
          updateWhitelistDisplay();

          console.log('Add current site complete');
        });
      } else {
        console.error('Add current site button not found');
      }

      // Timer presets
      const timerPresets = panel.querySelectorAll('.timer-preset');
      console.log('Timer preset buttons found:', timerPresets.length);
      timerPresets.forEach(btn => {
        btn.addEventListener('click', function () {
          const minutes = parseInt(this.dataset.minutes);
          console.log('Timer preset clicked:', minutes, 'minutes');
          setTimer(minutes);
        });
        btn.addEventListener('mouseenter', function () {
          this.style.background = '#3B82F6';
          this.style.borderColor = '#3B82F6';
        });
        btn.addEventListener('mouseleave', function () {
          this.style.background = 'rgba(255,255,255,0.05)';
          this.style.borderColor = '#374151';
        });
      });

      // Custom timer
      const setCustomBtn = panel.querySelector('#set-custom-timer');
      if (setCustomBtn) {
        setCustomBtn.addEventListener('click', () => {
          const customInput = panel.querySelector('#custom-minutes');
          const minutes = parseInt(customInput.value);
          console.log('Custom timer set:', minutes, 'minutes');
          if (minutes > 0) {
            setTimer(minutes);
          } else {
            alert('Please enter a valid number of minutes');
          }
        });
      }

      // Activate nuclear mode
      const activateBtn = panel.querySelector('#activate-nuclear');
      if (activateBtn) {
        activateBtn.addEventListener('click', activateNuclearMode);
      }

      const deactivateBtn = panel.querySelector('#deactivate-nuclear');
      if (deactivateBtn) {
        deactivateBtn.addEventListener('click', deactivateNuclearMode);
      }

      console.log('All event listeners attached');
    }

    // Set timer
    async function setTimer(minutes) {
      console.log('=== setTimer called ===');
      console.log('Setting timer for', minutes, 'minutes');
      timerEndTime = Date.now() + (minutes * 60 * 1000);
      console.log('timerEndTime set to:', timerEndTime);
      console.log('Timer will end at:', new Date(timerEndTime).toLocaleTimeString());

      await saveSettings();
      console.log('Settings saved after timer set');

      // Show visual feedback
      alert(`✓ Timer set for ${minutes} minutes! Click "Activate Nuclear Mode" to start.`);
    }

    // Start timer countdown
    function startTimer() {
      if (!checkContext()) return;
      if (timerInterval) clearInterval(timerInterval);

      timerInterval = setInterval(() => {
        if (!checkContext()) {
          clearInterval(timerInterval);
          return;
        }

        updateFloatingTimer();

        if (Date.now() >= timerEndTime) {
          clearInterval(timerInterval);
          deactivateNuclearMode();
        }
      }, 1000);
    }

    // Activate nuclear mode
    async function activateNuclearMode() {
      console.log('=== activateNuclearMode called ===');
      console.log('Whitelist length:', whitelist.length);
      console.log('timerEndTime:', timerEndTime);

      if (whitelist.length === 0) {
        alert('⚠️ Please add at least one website to the whitelist!');
        return;
      }
      if (!timerEndTime) {
        alert('⚠️ Please set a timer first!');
        return;
      }

      // Set active FIRST before saving
      isActive = true;

      // Save settings to storage
      await saveSettings();

      console.log('✅ Nuclear Mode activated!');
      console.log('Whitelist:', whitelist);
      console.log('Timer ends at:', new Date(timerEndTime).toLocaleTimeString());

      // Show success message
      alert(`🔒 Nuclear Mode Activated!\n\nTimer: ${Math.ceil((timerEndTime - Date.now()) / 60000)} minutes\n\nOnly whitelisted sites are accessible.\nAll other sites will be blocked.`);

      // Close main panel
      if (panel) panel.remove();

      // Check current site and block immediately if needed
      const currentDomain = window.location.hostname.replace(/^www\./, '');
      const isCurrentWhitelisted = whitelist.some(site => {
        const cleanSite = site.replace(/^https?:\/\//, '').replace(/^www\./, '');
        return currentDomain.includes(cleanSite) || cleanSite.includes(currentDomain);
      });

      if (!isCurrentWhitelisted) {
        // Current site is NOT whitelisted - block it immediately
        console.log('🔒 Current site is NOT whitelisted - blocking now');
        blockSiteCompletely();
      } else {
        // Current site IS whitelisted - show floating timer
        console.log('✅ Current site is whitelisted - showing timer');
        createFloatingTimer();
        startTimer();
        enableCloseWarning();
      }
    }

    // Create floating timer window
    let floatingTimer = null;
    function createFloatingTimer() {
      if (!checkContext()) return;

      // Wait for body to be ready
      const createTimer = () => {
        // Remove existing timer if any
        if (floatingTimer && floatingTimer.parentNode) {
          floatingTimer.remove();
        }

        floatingTimer = document.createElement('div');
        floatingTimer.id = 'nuclear-floating-timer';
        floatingTimer.style.cssText = `
        position: fixed; top: 20px; right: 20px; width: 200px; min-height: 100px;
        background: linear-gradient(135deg, #1F2937 0%, #111827 100%);
        border-radius: 12px; border: 2px solid #EF4444;
        box-shadow: 0 8px 32px rgba(239, 68, 68, 0.6); z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        color: #E5E7EB; padding: 16px; resize: both; overflow: hidden;
        min-width: 180px; min-height: 90px;
      `;

        floatingTimer.innerHTML = `
        <div id="timer-header" style="cursor: move; user-select: none; margin-bottom: 12px;">
          <div style="font-size: 12px; color: #EF4444; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">🔒 NUCLEAR MODE</div>
        </div>
        <div style="text-align: center;">
          <div id="floating-timer-value" style="font-size: 48px; font-weight: 700; color: #EF4444; line-height: 1;">--:--</div>
          <div style="font-size: 11px; color: #9CA3AF; margin-top: 8px;">Time Remaining</div>
        </div>
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #374151;">
          <div style="font-size: 10px; color: #6B7280; text-align: center;">Cannot be stopped</div>
        </div>
      `;

        document.body.appendChild(floatingTimer);
        updateFloatingTimer();
        makeFloatingTimerDraggable();

        console.log('Floating timer created on:', window.location.hostname);
      };

      // Check if body is ready
      if (document.body) {
        createTimer();
      } else {
        // Wait for body to be available
        const observer = new MutationObserver(() => {
          if (document.body) {
            observer.disconnect();
            createTimer();
          }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
      }
    }

    // Update floating timer display
    function updateFloatingTimer() {
      if (!checkContext()) return;
      if (!floatingTimer) return;

      const value = floatingTimer.querySelector('#floating-timer-value');
      if (!value) return;

      const remaining = Math.max(0, timerEndTime - Date.now());
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      value.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      // Pulse effect when time is running low (< 5 minutes)
      if (minutes < 5 && remaining > 0) {
        floatingTimer.style.animation = 'pulse 2s infinite';
      }
    }

    // Make floating timer draggable
    function makeFloatingTimerDraggable() {
      const header = floatingTimer.querySelector('#timer-header');
      let isDragging = false;
      let startX, startY, startLeft, startTop;

      header.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = floatingTimer.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;
        header.style.cursor = 'grabbing';
      });

      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        floatingTimer.style.left = (startLeft + dx) + 'px';
        floatingTimer.style.top = (startTop + dy) + 'px';
        floatingTimer.style.right = 'auto';
      });

      document.addEventListener('mouseup', () => {
        if (isDragging) {
          isDragging = false;
          header.style.cursor = 'move';
        }
      });
    }

    // Deactivate nuclear mode
    async function deactivateNuclearMode() {
      console.log('=== deactivateNuclearMode called ===');
      isActive = false;
      timerEndTime = null;
      if (timerInterval) clearInterval(timerInterval);
      disableCloseWarning();

      // Save with isActive: false to stop blocking
      await saveSettings();

      // Turn off the toggle in sync storage
      await browserAPI.storage.sync.set({ passiveWatching: false });

      console.log('✅ Nuclear Mode deactivated - storage cleared');

      if (panel) {
        const activateBtn = panel.querySelector('#activate-nuclear');
        const deactivateBtn = panel.querySelector('#deactivate-nuclear');
        if (activateBtn) activateBtn.style.display = 'block';
        if (deactivateBtn) deactivateBtn.style.display = 'none';
      }

      // Remove floating timer
      if (floatingTimer) floatingTimer.remove();

      // Remove block overlay if exists
      const blockOverlay = document.getElementById('nuclear-mode-block');
      if (blockOverlay) blockOverlay.remove();

      // Remove block container if exists
      const blockContainer = document.getElementById('nuclear-block-container');
      if (blockContainer) blockContainer.remove();

      // Deactivation successful - page will just reload
      console.log('✅ Nuclear Mode deactivated! Page will reload.');

      // Reload current page after a brief delay
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }

    // Show active state
    function showActiveState() {
      if (panel) {
        panel.querySelector('#activate-nuclear').style.display = 'none';
        panel.querySelector('#deactivate-nuclear').style.display = 'block';
      }
    }

    // Make panel draggable
    function makeDraggable() {
      const header = panel.querySelector('#panel-header');
      let isDragging = false;
      let startX, startY, startLeft, startTop;

      header.addEventListener('mousedown', (e) => {
        if (e.target.id === 'close-panel' || e.target.closest('#close-panel')) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = panel.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;
        panel.style.transform = 'none';
        header.style.cursor = 'grabbing';
      });

      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        panel.style.left = (startLeft + dx) + 'px';
        panel.style.top = (startTop + dy) + 'px';
      });

      document.addEventListener('mouseup', () => {
        if (isDragging) {
          isDragging = false;
          header.style.cursor = 'move';
        }
      });
    }

    // Make panel resizable
    function makeResizable() {
      const handle = panel.querySelector('#resize-handle');
      let isResizing = false;
      let startX, startY, startWidth, startHeight;

      handle.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = panel.offsetWidth;
        startHeight = panel.offsetHeight;
        e.preventDefault();
        e.stopPropagation();
      });

      document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        panel.style.width = Math.max(400, startWidth + dx) + 'px';
        panel.style.height = Math.max(350, startHeight + dy) + 'px';
      });

      document.addEventListener('mouseup', () => {
        isResizing = false;
      });
    }

    // Initialize
    console.log('Nuclear Mode initializing...');

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
    @keyframes pulse {
      0%, 100% { 
        box-shadow: 0 8px 32px rgba(239, 68, 68, 0.6);
        border-color: #EF4444;
      }
      50% { 
        box-shadow: 0 8px 48px rgba(239, 68, 68, 1);
        border-color: #DC2626;
      }
    }
    
    #nuclear-floating-timer {
      pointer-events: auto !important;
    }
    
    #nuclear-mode-panel {
      pointer-events: auto !important;
    }
  `;
    document.head.appendChild(style);

    createPanel();
    console.log('Nuclear Mode panel created');

    // Cleanup function - FORCEFULLY stop Nuclear Mode (called when toggle is turned OFF)
    function cleanup() {
      console.log('🛑🛑🛑 NUCLEAR MODE CLEANUP CALLED - TOGGLE TURNED OFF 🛑🛑🛑');

      // Set a flag in sessionStorage to prevent infinite reload loop
      try {
        sessionStorage.setItem('nuclearModeCleanupDone', 'true');
        console.log('✅ Set cleanup flag in sessionStorage');
      } catch (e) {
        console.log('⚠️ Could not set sessionStorage flag:', e);
      }

      // FORCE set isActive to false
      isActive = false;
      timerEndTime = null;

      // Clear Nuclear Mode from storage IMMEDIATELY
      const clearData = {
        nuclearMode: {
          whitelist: [],
          timerEndTime: null,
          isActive: false
        }
      };

      console.log('🛑 Setting storage to:', clearData);

      browserAPI.storage.local.set(clearData, () => {
        console.log('✅ Nuclear Mode storage CLEARED - isActive = false');

        // Verify it was cleared
        browserAPI.storage.local.get('nuclearMode', (result) => {
          console.log('🔍 Verification - Storage after clear:', result);
        });
      });

      // Clean up UI elements
      console.log('🧹 Cleaning up UI elements...');
      if (panel && panel.parentNode) {
        panel.remove();
        console.log('✅ Panel removed');
      }
      if (floatingTimer && floatingTimer.parentNode) {
        floatingTimer.remove();
        console.log('✅ Floating timer removed');
      }
      if (timerInterval) {
        clearInterval(timerInterval);
        console.log('✅ Timer interval cleared');
      }
      disableCloseWarning();

      const blockContainer = document.getElementById('nuclear-block-container');
      if (blockContainer) {
        blockContainer.remove();
        console.log('✅ Block container removed');
      }
      if (style && style.parentNode) {
        style.remove();
        console.log('✅ Styles removed');
      }

      isContextValid = false;

      // Notify background to update all tabs
      browserAPI.runtime.sendMessage({
        type: 'NUCLEAR_MODE_UPDATE',
        data: {
          whitelist: [],
          timerEndTime: null,
          isActive: false
        }
      }, () => {
        console.log('✅ Background notified of deactivation');
      });

      // RELOAD page to unblock (with delay to ensure storage is cleared)
      console.log('🔄 RELOADING PAGE in 500ms to unblock...');
      setTimeout(() => {
        console.log('🔄 RELOADING NOW!');
        window.location.reload();
      }, 500);
    }

    return {
      cleanup: cleanup
    };
  } // End of initializePanel()
}
