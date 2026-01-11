// Nuclear Mode - Website blocker with whitelist and timer
export function initPassiveWatching() {
  const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
  
  let panel = null;
  let whitelist = [];
  let timerEndTime = null;
  let timerInterval = null;
  let isActive = false;
  let isContextValid = true;

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

  // Load saved settings
  safeStorageGet(['nuclearMode']).then((result) => {
    if (!checkContext()) return;
    
    if (result.nuclearMode) {
      whitelist = result.nuclearMode.whitelist || [];
      timerEndTime = result.nuclearMode.timerEndTime || null;
      isActive = result.nuclearMode.isActive || false;
      
      if (isActive && timerEndTime) {
        // Check if timer expired
        if (Date.now() > timerEndTime) {
          deactivateNuclearMode();
          return;
        }
        
        checkAndBlockSite();
        
        // Show floating timer on ALL tabs (whitelisted or not)
        if (!floatingTimer) {
          createFloatingTimer();
        }
        startTimer();
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
        checkAndBlockSite();
        
        // Show floating timer on ALL tabs
        if (!floatingTimer) {
          createFloatingTimer();
        }
        
        if (!timerInterval) {
          startTimer();
        }
      } else {
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
    if (!checkContext()) return;
    if (!isActive || !timerEndTime) return;
    
    const now = Date.now();
    if (now > timerEndTime) {
      // Timer expired
      deactivateNuclearMode();
      return;
    }

    const currentDomain = window.location.hostname;
    const isWhitelisted = whitelist.some(site => {
      const cleanSite = site.replace(/^https?:\/\//, '').replace(/^www\./, '');
      const cleanCurrent = currentDomain.replace(/^www\./, '');
      return cleanCurrent.includes(cleanSite) || cleanSite.includes(cleanCurrent);
    });

    if (!isWhitelisted) {
      showBlockedPage();
    }

    // Add warning before closing browser/tab
    enableCloseWarning();
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

  // Show blocked page overlay
  function showBlockedPage() {
    if (!checkContext()) return;
    
    const overlay = document.createElement('div');
    overlay.id = 'nuclear-mode-block';
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
      background: linear-gradient(135deg, #1F2937 0%, #111827 100%);
      z-index: 2147483646; display: flex; align-items: center; justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;

    const timeLeft = Math.ceil((timerEndTime - Date.now()) / 1000 / 60);
    
    overlay.innerHTML = `
      <div style="text-align: center; color: white; max-width: 500px; padding: 40px;">
        <div style="font-size: 72px; margin-bottom: 24px;">🔒</div>
        <h1 style="font-size: 36px; margin: 0 0 16px 0; font-weight: 700;">Nuclear Mode Active</h1>
        <p style="font-size: 18px; color: #9CA3AF; margin-bottom: 32px;">
          This website is blocked. You can only access whitelisted sites.
        </p>
        <div style="background: rgba(239, 68, 68, 0.1); border: 2px solid #EF4444; padding: 24px; border-radius: 16px; margin-bottom: 24px;">
          <div style="font-size: 14px; color: #FCA5A5; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Time Remaining</div>
          <div id="block-timer" style="font-size: 64px; font-weight: 700; color: #EF4444;">${timeLeft} min</div>
        </div>
        <div style="background: rgba(255,255,255,0.05); border: 1px solid #374151; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
          <div style="font-size: 14px; color: #D1D5DB; margin-bottom: 12px; font-weight: 600;">Whitelisted Sites:</div>
          <div style="font-size: 13px; color: #9CA3AF; line-height: 1.8;">
            ${whitelist.map(site => `<div>✓ ${site}</div>`).join('')}
          </div>
        </div>
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid #EF4444; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
          <p style="font-size: 14px; color: #FCA5A5; margin: 0;">
            ⚠️ Timer cannot be stopped. Stay focused!
          </p>
        </div>
        <p style="font-size: 14px; color: #6B7280;">
          Navigate to a whitelisted site to continue working.
        </p>
      </div>
    `;

    document.body.innerHTML = '';
    document.body.appendChild(overlay);

    // Prevent right-click and shortcuts
    document.addEventListener('contextmenu', preventEscape, true);
    document.addEventListener('keydown', preventEscapeKeys, true);

    // Update timer every second
    const updateBlockTimer = setInterval(() => {
      if (!checkContext()) {
        clearInterval(updateBlockTimer);
        return;
      }
      
      const remaining = Math.ceil((timerEndTime - Date.now()) / 1000 / 60);
      const timerEl = document.getElementById('block-timer');
      if (timerEl) {
        if (remaining > 0) {
          timerEl.textContent = `${remaining} min`;
        } else {
          timerEl.textContent = 'Done!';
          clearInterval(updateBlockTimer);
          deactivateNuclearMode();
          window.location.reload();
        }
      }
    }, 1000);
  }

  // Prevent escape attempts
  function preventEscape(e) {
    if (!checkContext()) return;
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  function preventEscapeKeys(e) {
    if (!checkContext()) return;
    
    // Prevent: F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+W, Ctrl+T, Alt+F4
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
      (e.ctrlKey && e.key === 'u') ||
      (e.ctrlKey && e.key === 'w') ||
      (e.ctrlKey && e.key === 't') ||
      (e.altKey && e.key === 'F4')
    ) {
      e.preventDefault();
      e.stopPropagation();
      showWarningNotification('Nuclear Mode is active! Stay focused!');
      return false;
    }
  }

  function showWarningNotification(message) {
    if (!checkContext()) return;
    
    const notif = document.createElement('div');
    notif.textContent = message;
    notif.style.cssText = `
      position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
      background: #EF4444; color: white; padding: 16px 24px; border-radius: 8px;
      font-size: 16px; font-weight: 600; z-index: 9999999999;
      box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);
      animation: shake 0.5s;
    `;
    document.body.appendChild(notif);
    setTimeout(() => {
      if (notif && notif.parentNode) {
        notif.remove();
      }
    }, 3000);
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
      btn.addEventListener('click', function(e) {
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
      
      btn.addEventListener('mouseenter', function() {
        this.style.background = '#EF4444';
        this.style.color = 'white';
      });
      
      btn.addEventListener('mouseleave', function() {
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

      closeBtn.addEventListener('mouseenter', function() {
        this.style.background = 'rgba(239, 68, 68, 0.1)';
        this.style.color = '#EF4444';
      });
      closeBtn.addEventListener('mouseleave', function() {
        this.style.background = 'transparent';
        this.style.color = '#9CA3AF';
      });
    }

    // Add whitelist function
    const addWhitelist = () => {
      if (!checkContext()) {
        alert('Extension context invalid. Please reload the page.');
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
      btn.addEventListener('click', function() {
        const minutes = parseInt(this.dataset.minutes);
        console.log('Timer preset clicked:', minutes, 'minutes');
        setTimer(minutes);
      });
      btn.addEventListener('mouseenter', function() {
        this.style.background = '#3B82F6';
        this.style.borderColor = '#3B82F6';
      });
      btn.addEventListener('mouseleave', function() {
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
  function setTimer(minutes) {
    timerEndTime = Date.now() + (minutes * 60 * 1000);
    saveSettings();
    updateTimerDisplay();
    startTimer();
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
  function activateNuclearMode() {
    if (whitelist.length === 0) {
      alert('⚠️ Please add at least one website to the whitelist!');
      return;
    }
    if (!timerEndTime) {
      alert('⚠️ Please set a timer first!');
      return;
    }

    isActive = true;
    saveSettings();
    showActiveState();
    
    // Close main panel
    if (panel) panel.remove();
    
    // Create floating timer (will appear on all tabs via message)
    createFloatingTimer();
    
    // Check and block current site if needed
    checkAndBlockSite();
    
    console.log('Nuclear Mode activated!');
    console.log('Whitelist:', whitelist);
    console.log('Timer ends at:', new Date(timerEndTime).toLocaleTimeString());
  }

  // Create floating timer window
  let floatingTimer = null;
  function createFloatingTimer() {
    if (!checkContext()) return;
    
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
  function deactivateNuclearMode() {
    isActive = false;
    timerEndTime = null;
    if (timerInterval) clearInterval(timerInterval);
    disableCloseWarning();
    saveSettings();
    
    if (panel) {
      panel.querySelector('#activate-nuclear').style.display = 'block';
      panel.querySelector('#deactivate-nuclear').style.display = 'none';
    }

    // Remove floating timer
    if (floatingTimer) floatingTimer.remove();

    // Remove block overlay if exists
    const blockOverlay = document.getElementById('nuclear-mode-block');
    if (blockOverlay) blockOverlay.remove();

    // Remove event listeners
    document.removeEventListener('contextmenu', preventEscape, true);
    document.removeEventListener('keydown', preventEscapeKeys, true);
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

  // Cleanup function
  function cleanup() {
    console.log('Nuclear Mode cleanup');
    if (panel && panel.parentNode) panel.remove();
    if (floatingTimer && floatingTimer.parentNode) floatingTimer.remove();
    if (timerInterval) clearInterval(timerInterval);
    disableCloseWarning();
    document.removeEventListener('contextmenu', preventEscape, true);
    document.removeEventListener('keydown', preventEscapeKeys, true);
    if (style && style.parentNode) style.remove();
    isContextValid = false;
  }

  return {
    cleanup: cleanup
  };
}
