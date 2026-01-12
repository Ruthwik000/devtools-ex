// Nuclear Mode Blocker - Runs IMMEDIATELY on page load (BEFORE anything else)
// This is a standalone blocker that mimics the Site-Blocker-Chrome-Extension approach

// Use the browserAPI that's already declared in the bundle
console.log('🚀 Nuclear Mode Blocker: Script loaded');

// Normalize URL by removing 'www.' from the beginning
function normalizeURL(url) {
  return url.replace(/^www\./i, "");
}

// Check if the current website should be blocked
function shouldBlockWebsite(whitelistSet) {
  const currentHostname = normalizeURL(window.location.hostname);
  console.log('🔍 Nuclear Blocker: Checking hostname:', currentHostname);
  console.log('🔍 Nuclear Blocker: Whitelist:', whitelistSet);

  // Check if current site is in whitelist
  const isWhitelisted = whitelistSet.some(site => {
    const normalizedSite = normalizeURL(site);
    const matches = currentHostname === normalizedSite || currentHostname.includes(normalizedSite);
    console.log(`  🔍 Comparing ${currentHostname} with ${normalizedSite}: ${matches}`);
    return matches;
  });

  console.log('🔍 Nuclear Blocker: Is whitelisted:', isWhitelisted);
  return !isWhitelisted; // Block if NOT whitelisted
}

// Create the blocked page
function createBlockedPage(endTime, wl) {
  console.log('🔒 Nuclear Blocker: BLOCKING PAGE NOW!');

  // STOP page loading immediately
  try {
    window.stop();
  } catch (e) {
    console.log('Could not stop page loading:', e);
  }

  // Clear EVERYTHING from HTML
  const html = document.documentElement;
  if (html) {
    html.innerHTML = "";
  }

  const timeLeft = Math.ceil((endTime - Date.now()) / 1000 / 60);

  // Create HEAD with styles
  const head = document.createElement('head');
  const style = document.createElement('style');
  style.textContent = `
    @import url("https://fonts.googleapis.com/css?family=Aboreto");

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
  head.appendChild(style);

  // Create BODY with blocked content
  const body = document.createElement("body");
  body.innerHTML = `
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
  `;

  // Append head and body to html
  html.appendChild(head);
  html.appendChild(body);

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
}

// Check if the website should be blocked and take appropriate action
function check_if_restricted(nuclearMode) {
  console.log('🔍 Nuclear Blocker: check_if_restricted called');
  console.log('🔍 Nuclear Blocker: Nuclear Mode data:', nuclearMode);
  console.log('🔍 Nuclear Blocker: isActive:', nuclearMode?.isActive);
  console.log('🔍 Nuclear Blocker: timerEndTime:', nuclearMode?.timerEndTime);
  console.log('🔍 Nuclear Blocker: Current time:', Date.now());

  if (!nuclearMode || !nuclearMode.isActive || !nuclearMode.timerEndTime) {
    console.log('❌ Nuclear Blocker: Nuclear Mode not active or no timer');
    return;
  }

  // Check if timer hasn't expired
  if (Date.now() >= nuclearMode.timerEndTime) {
    console.log('❌ Nuclear Blocker: Timer expired - clearing storage');
    // Clear the nuclear mode from storage
    browserAPI.storage.local.set({
      nuclearMode: {
        whitelist: nuclearMode.whitelist || [],
        timerEndTime: null,
        isActive: false
      }
    });
    return;
  }

  const whitelistSet = nuclearMode.whitelist || [];

  if (shouldBlockWebsite(whitelistSet)) {
    console.log('🔒 Nuclear Blocker: SHOULD BLOCK - Creating blocked page');
    createBlockedPage(nuclearMode.timerEndTime, whitelistSet);
  } else {
    console.log('✅ Nuclear Blocker: Site is whitelisted - allowing access');
  }
}

// ============================================
// IMMEDIATE EXECUTION (EXACT same as reference site blocker)
// ============================================

// Retrieve Nuclear Mode data from storage and block if needed
browserAPI.storage.local.get("nuclearMode", function (data) {
  console.log('📦 Nuclear Blocker: Storage data retrieved:', JSON.stringify(data, null, 2));
  const nuclearMode = data.nuclearMode || null;

  console.log('📦 Nuclear Blocker: nuclearMode object:', nuclearMode);
  console.log('📦 Nuclear Blocker: isActive:', nuclearMode?.isActive);
  console.log('📦 Nuclear Blocker: timerEndTime:', nuclearMode?.timerEndTime);
  console.log('📦 Nuclear Blocker: Current time:', Date.now());

  if (nuclearMode && nuclearMode.isActive && nuclearMode.timerEndTime) {
    console.log('✅ Nuclear Blocker: Nuclear Mode is active with timer');

    // Check if timer hasn't expired
    if (Date.now() < nuclearMode.timerEndTime) {
      console.log('✅ Nuclear Blocker: Timer is still valid');

      // Call check function to block if needed
      check_if_restricted(nuclearMode);
    } else {
      console.log('❌ Nuclear Blocker: Timer expired');
    }
  } else {
    console.log('❌ Nuclear Blocker: Nuclear Mode NOT active');
    console.log('   - nuclearMode exists:', !!nuclearMode);
    console.log('   - isActive:', nuclearMode?.isActive);
    console.log('   - timerEndTime:', nuclearMode?.timerEndTime);
  }
});

console.log('🚀 Nuclear Mode Blocker: Script execution complete');
