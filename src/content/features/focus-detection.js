// Focus Detection - Webcam-based focus monitoring
export function initFocusDetection() {
  const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
  
  let panel = null;
  let videoStream = null;
  let isDetecting = false;
  let detectionInterval = null;
  let alertAudio = null;
  let lastAlertTime = 0;
  let currentPredictions = []; // Store current predictions for drawing
  let isMinimized = false;
  const ALERT_COOLDOWN = 5000; // 5 seconds cooldown between alerts
  const DETECTION_INTERVAL = 2000; // 2 seconds
  const CONFIDENCE_THRESHOLD = 0.45;

  // Initialize audio
  function initAudio() {
    try {
      const audioUrl = browserAPI.runtime.getURL('audio/alert.mp3');
      alertAudio = new Audio(audioUrl);
      alertAudio.volume = 0.7;
      
      alertAudio.addEventListener('error', () => {
        const wavUrl = browserAPI.runtime.getURL('audio/alert.wav');
        alertAudio = new Audio(wavUrl);
        alertAudio.volume = 0.7;
      });
    } catch (error) {
      // Silent fail
    }
  }

  // Play alert sound
  function playAlert() {
    const now = Date.now();
    if (now - lastAlertTime < ALERT_COOLDOWN) {
      return;
    }
    
    lastAlertTime = now;
    
    if (alertAudio) {
      alertAudio.currentTime = 0;
      alertAudio.play()
        .catch(() => {
          try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            gainNode.gain.value = 0.3;
            
            oscillator.start();
            setTimeout(() => oscillator.stop(), 200);
          } catch (beepErr) {
            // Silent fail
          }
        });
    }
  }

  // Create floating status panel with video feed and bounding boxes
  function createPanel() {
    // Wait for body to exist
    if (!document.body) {
      console.log('Waiting for document.body...');
      setTimeout(createPanel, 100);
      return;
    }

    panel = document.createElement('div');
    panel.id = 'focus-detection-panel';
    panel.style.cssText = `
      position: fixed; top: 80px; right: 20px; width: 420px; min-height: 400px;
      background: linear-gradient(135deg, #1F2937 0%, #111827 100%);
      border-radius: 16px; border: 1px solid #374151;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6); z-index: 9999998;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #E5E7EB; overflow: hidden; display: flex; flex-direction: column;
    `;

    panel.innerHTML = `
      <style>
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
      <div id="focus-header" style="background: linear-gradient(135deg, #374151 0%, #1F2937 100%); padding: 12px 16px; cursor: move; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #374151; user-select: none;">
        <h2 id="focus-title" style="margin: 0; font-size: 14px; font-weight: 600; color: #F9FAFB;">Focus Detection</h2>
        <div style="display: flex; align-items: center; gap: 6px;">
          <button id="minimize-focus-panel" title="Minimize" style="background: transparent; border: none; color: #9CA3AF; cursor: pointer; font-size: 20px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 6px; transition: all 0.2s; font-weight: bold;">−</button>
          <button id="close-focus-panel" style="background: transparent; border: none; color: #9CA3AF; cursor: pointer; font-size: 20px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 6px; transition: all 0.2s;">×</button>
        </div>
      </div>

      <div style="padding: 16px; flex: 1; display: flex; flex-direction: column; gap: 12px;">
        <p style="font-size: 12px; color: #9CA3AF; margin: 0;">AI-powered mobile phone detection (Roboflow API)</p>
        
        <div style="position: relative; width: 100%; aspect-ratio: 4/3; background: #000; border-radius: 12px; overflow: hidden; border: 2px solid #374151;">
          <canvas id="detection-canvas" style="width: 100%; height: 100%; object-fit: contain;"></canvas>
          <div id="camera-loading" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #1F2937;">
            <div style="text-align: center; color: #6B7280;">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 8px; animation: spin 2s linear infinite;">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <div style="font-size: 12px;">Requesting Camera Access...</div>
            </div>
          </div>
        </div>

        <div id="detection-info" style="font-size: 11px; color: #6B7280; text-align: center;">
          Scanning every 2 seconds • Confidence threshold: 45%
        </div>
      </div>
    `;

    document.body.appendChild(panel);
    attachEventListeners();
    makeDraggable();
    console.log('Focus Detection panel created');
  }

  // Start webcam and request permission
  async function startWebcam() {
    try {
      console.log('Requesting camera permission...');
      console.log('Is secure context?', window.isSecureContext);
      console.log('navigator.mediaDevices available?', !!navigator.mediaDevices);
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not supported in this context');
      }
      
      videoStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 },
        audio: false 
      });
      
      console.log('Camera access granted!');
      isDetecting = true;
      
      // Create a hidden video element for live feed
      const video = document.createElement('video');
      video.id = 'focus-detection-video';
      video.srcObject = videoStream;
      video.autoplay = true;
      video.playsInline = true;
      video.muted = true;
      video.style.position = 'fixed';
      video.style.top = '-9999px';
      video.style.left = '-9999px';
      document.body.appendChild(video);
      
      // Wait for video to be ready and playing
      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          video.play().then(resolve);
        };
      });
      
      console.log('Video ready, dimensions:', video.videoWidth, 'x', video.videoHeight);
      
      // Get canvas for drawing
      const canvas = panel?.querySelector('#detection-canvas');
      if (canvas) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        // Hide loading indicator
        const loading = panel?.querySelector('#camera-loading');
        if (loading) {
          loading.style.display = 'none';
        }
        
        // Start continuous rendering of video feed
        const renderLoop = () => {
          if (!isDetecting || !videoStream) return;
          
          const ctx = canvas.getContext('2d');
          if (video.readyState === video.HAVE_ENOUGH_DATA) {
            // Draw video frame
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Draw bounding boxes on top
            if (currentPredictions && currentPredictions.length > 0) {
              currentPredictions.forEach(pred => {
                const { x, y, width, height, confidence, class: className } = pred;
                
                // Determine color based on confidence
                const isHighConfidence = confidence >= CONFIDENCE_THRESHOLD;
                const color = isHighConfidence ? '#EF4444' : '#FCD34D';
                const alpha = isHighConfidence ? 0.8 : 0.5;
                
                // Draw bounding box
                ctx.strokeStyle = color;
                ctx.lineWidth = 3;
                ctx.strokeRect(x - width / 2, y - height / 2, width, height);
                
                // Draw filled background for label
                const label = `${className || 'phone'} ${Math.round(confidence * 100)}%`;
                ctx.font = 'bold 14px Arial';
                const textWidth = ctx.measureText(label).width;
                
                ctx.fillStyle = color;
                ctx.globalAlpha = alpha;
                ctx.fillRect(x - width / 2, y - height / 2 - 25, textWidth + 10, 25);
                
                // Draw label text
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'white';
                ctx.fillText(label, x - width / 2 + 5, y - height / 2 - 7);
              });
            }
          }
          
          requestAnimationFrame(renderLoop);
        };
        renderLoop();
      }
      
      startDetection();
    } catch (error) {
      console.error('Error accessing webcam:', error);
      const loading = panel?.querySelector('#camera-loading');
      if (loading) {
        loading.innerHTML = `
          <div style="text-align: center; color: #EF4444;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 8px;">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <div style="font-size: 12px;">Camera Access Denied</div>
            <div style="font-size: 10px; margin-top: 4px;">Please grant camera permission</div>
          </div>
        `;
      }
      
      // Turn off the toggle since camera access failed
      browserAPI.storage.sync.get(['toggles'], (result) => {
        const toggles = result.toggles || {};
        toggles.focusDetection = false;
        browserAPI.storage.sync.set({ toggles });
      });
    }
  }

  // Start detection loop
  function startDetection() {
    if (!videoStream) return;
    
    console.log('Starting detection loop...');
    
    detectionInterval = setInterval(async () => {
      if (isDetecting && videoStream) {
        await detectPhoneUsage();
      }
    }, DETECTION_INTERVAL);
  }

  // Capture frame and send to Roboflow API
  async function detectPhoneUsage() {
    try {
      // Get the video element
      const video = document.getElementById('focus-detection-video');
      if (!video || video.videoWidth === 0) {
        console.log('Video not ready yet');
        return;
      }
      
      // Create canvas and capture frame
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Send to Roboflow API
      const API_KEY = 'dnJH9C8BFgg1vaBXQaz1';
      const API_URL = 'https://serverless.roboflow.com/mobile-phone-detection-2vads/1';
      
      const response = await fetch(`${API_URL}?api_key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: imageData
      });

      const data = await response.json();
      console.log('Detection result:', data);
      
      // Draw bounding boxes on the display canvas
      drawBoundingBoxes(data.predictions || []);
      
      // Filter high-confidence predictions
      const highConfidencePredictions = (data.predictions || []).filter(
        pred => pred.confidence >= CONFIDENCE_THRESHOLD
      );
      
      // Update status
      if (highConfidencePredictions.length > 0) {
        updateStatus(false);
        
        // Show notification
        const confidence = Math.round(highConfidencePredictions[0].confidence * 100);
        console.log(`Phone detected with ${confidence}% confidence!`);
      } else {
        // Reset to focused if no high-confidence detections
        const indicator = panel?.querySelector('#status-indicator');
        if (indicator && indicator.style.background === 'rgb(239, 68, 68)') {
          // Only reset if it was showing alert
          setTimeout(() => updateStatus(true), 3000);
        }
      }
      
    } catch (error) {
      console.error('Detection error:', error);
    }
  }

  // Show alert overlay on screen
  function showAlertOverlay() {
    // Wait for body to exist
    if (!document.body) {
      console.log('Waiting for document.body to show overlay...');
      setTimeout(showAlertOverlay, 100);
      return;
    }

    // Check if overlay already exists
    let overlay = document.getElementById('focus-detection-alert-overlay');
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
    overlay.id = 'focus-detection-alert-overlay';
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

    // Remove overlay after animation
    setTimeout(() => {
      if (overlay && overlay.parentNode) {
        overlay.remove();
      }
    }, 4000);
  }

  // Update status indicator
  function updateStatus(isFocused) {
    // When phone is detected, play alert sound and show overlay
    if (!isFocused) {
      console.log('📱 Phone detected! Broadcasting to all tabs...');
      playAlert();
      showAlertOverlay();
      
      // Broadcast alert to all tabs via background script
      browserAPI.runtime.sendMessage({
        type: 'PHONE_DETECTED',
        timestamp: Date.now()
      }).then(response => {
        console.log('✅ Phone detection message sent successfully:', response);
      }).catch(error => {
        console.error('❌ Failed to send phone detection message:', error);
      });
    }
  }

  // Draw bounding boxes on top of live video feed
  function drawBoundingBoxes(predictions) {
    // Store predictions for the render loop to draw
    currentPredictions = predictions || [];
    
    // Update detection info
    const detectionInfo = panel?.querySelector('#detection-info');
    if (detectionInfo) {
      if (predictions && predictions.length > 0) {
        const highConfCount = predictions.filter(p => p.confidence >= CONFIDENCE_THRESHOLD).length;
        const lowConfCount = predictions.length - highConfCount;
        detectionInfo.textContent = `Detected: ${highConfCount} high confidence${lowConfCount > 0 ? `, ${lowConfCount} low confidence` : ''} • Threshold: 45%`;
      } else {
        detectionInfo.textContent = 'Scanning every 2 seconds • Confidence threshold: 45%';
      }
    }
  }

  // Attach event listeners
  function attachEventListeners() {
    // Minimize button
    const minimizeBtn = panel.querySelector('#minimize-focus-panel');
    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMinimize();
      });

      // Minimize button hover
      minimizeBtn.addEventListener('mouseenter', () => {
        minimizeBtn.style.background = 'rgba(59, 130, 246, 0.1)';
        minimizeBtn.style.color = '#3B82F6';
      });
      minimizeBtn.addEventListener('mouseleave', () => {
        minimizeBtn.style.background = 'transparent';
        minimizeBtn.style.color = '#9CA3AF';
      });
    }

    // Close button - turn off toggle
    const closeBtn = panel.querySelector('#close-focus-panel');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        stopDetection();
        panel.remove();
        // Turn off the toggle in popup
        browserAPI.storage.sync.get(['toggles'], (result) => {
          const toggles = result.toggles || {};
          toggles.focusDetection = false;
          browserAPI.storage.sync.set({ toggles });
        });
      });

      // Close button hover
      closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = 'rgba(239, 68, 68, 0.1)';
        closeBtn.style.color = '#EF4444';
      });
      closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = 'transparent';
        closeBtn.style.color = '#9CA3AF';
      });
    }

    // Click to expand when minimized
    panel.addEventListener('click', (e) => {
      if (isMinimized && !e.target.closest('#close-focus-panel') && !isDraggingPanel) {
        toggleMinimize();
      }
    });
  }

  // Toggle minimize state
  function toggleMinimize() {
    isMinimized = !isMinimized;
    updateMinimizedState();
  }

  // Update minimized state
  function updateMinimizedState() {
    const body = panel.querySelector('div[style*="padding: 16px"]');
    const title = panel.querySelector('#focus-title');
    const minimizeBtn = panel.querySelector('#minimize-focus-panel');
    const closeBtn = panel.querySelector('#close-focus-panel');
    const header = panel.querySelector('#focus-header');

    if (isMinimized) {
      // Hide body content
      if (body) body.style.display = 'none';
      
      // Minimize panel to circular icon
      panel.style.width = '48px';
      panel.style.height = '48px';
      panel.style.minWidth = '48px';
      panel.style.minHeight = '48px';
      panel.style.borderRadius = '50%';
      panel.style.padding = '0';
      panel.style.cursor = 'move';
      panel.style.background = 'linear-gradient(135deg, #374151 0%, #1F2937 100%)';
      
      // Update header
      header.style.padding = '0';
      header.style.marginBottom = '0';
      header.style.borderBottom = 'none';
      header.style.justifyContent = 'center';
      header.style.cursor = 'move';
      header.style.height = '48px';
      header.style.background = 'transparent';
      
      // Hide title and buttons
      if (title) title.style.display = 'none';
      if (minimizeBtn) minimizeBtn.style.display = 'none';
      if (closeBtn) closeBtn.style.display = 'none';
      
      // Add camera icon
      header.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" stroke-width="2">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
          <circle cx="12" cy="13" r="4"/>
        </svg>
      `;
    } else {
      // Restore full panel
      if (body) body.style.display = 'flex';
      
      panel.style.width = '420px';
      panel.style.height = '';
      panel.style.minWidth = '420px';
      panel.style.minHeight = '400px';
      panel.style.borderRadius = '16px';
      panel.style.padding = '0';
      panel.style.cursor = 'default';
      panel.style.background = 'linear-gradient(135deg, #1F2937 0%, #111827 100%)';
      
      // Restore header
      header.style.padding = '12px 16px';
      header.style.marginBottom = '0';
      header.style.borderBottom = '1px solid #374151';
      header.style.justifyContent = 'space-between';
      header.style.cursor = 'move';
      header.style.height = '';
      header.style.background = 'linear-gradient(135deg, #374151 0%, #1F2937 100%)';
      
      // Restore header content
      header.innerHTML = `
        <h2 id="focus-title" style="margin: 0; font-size: 14px; font-weight: 600; color: #F9FAFB;">Focus Detection</h2>
        <div style="display: flex; align-items: center; gap: 6px;">
          <button id="minimize-focus-panel" title="Minimize" style="background: transparent; border: none; color: #9CA3AF; cursor: pointer; font-size: 20px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 6px; transition: all 0.2s; font-weight: bold;">−</button>
          <button id="close-focus-panel" style="background: transparent; border: none; color: #9CA3AF; cursor: pointer; font-size: 20px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 6px; transition: all 0.2s;">×</button>
        </div>
      `;
      
      // Reattach event listeners
      attachEventListeners();
    }
  }

  // Stop detection
  function stopDetection() {
    isDetecting = false;
    if (detectionInterval) {
      clearInterval(detectionInterval);
      detectionInterval = null;
    }
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      videoStream = null;
    }
    
    // Remove video element
    const video = document.getElementById('focus-detection-video');
    if (video) {
      video.remove();
    }
    
    console.log('Focus detection stopped');
  }

  // Make panel draggable
  let isDraggingPanel = false;
  let dragStartX, dragStartY, dragStartLeft, dragStartTop;

  function makeDraggable() {
    const header = panel.querySelector('#focus-header');

    function handleDragStart(e) {
      // When minimized, allow dragging from anywhere on the panel
      if (isMinimized) {
        if (e.target.closest('#close-focus-panel')) return;
      } else {
        // When expanded, only drag from header (not buttons)
        if (e.target.closest('button')) return;
      }

      isDraggingPanel = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      const rect = panel.getBoundingClientRect();
      dragStartLeft = rect.left;
      dragStartTop = rect.top;
      
      if (isMinimized) {
        panel.style.cursor = 'grabbing';
      } else {
        header.style.cursor = 'grabbing';
      }
    }

    header.addEventListener('mousedown', handleDragStart);
    
    // Add drag handler to entire panel when minimized
    panel.addEventListener('mousedown', (e) => {
      if (isMinimized) {
        handleDragStart(e);
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDraggingPanel) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      panel.style.left = (dragStartLeft + dx) + 'px';
      panel.style.top = (dragStartTop + dy) + 'px';
      panel.style.right = 'auto';
    });

    document.addEventListener('mouseup', () => {
      if (isDraggingPanel) {
        isDraggingPanel = false;
        if (isMinimized) {
          panel.style.cursor = 'move';
        } else {
          header.style.cursor = 'move';
        }
      }
    });
  }

  // Initialize
  initAudio();
  createPanel();
  startWebcam(); // Request camera permission immediately

  return {
    cleanup: () => {
      stopDetection();
      if (panel) panel.remove();
    }
  };
}
