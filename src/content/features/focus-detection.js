// Focus Detection - Webcam-based focus monitoring
export function initFocusDetection() {
  const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
  
  let panel = null;
  let videoStream = null;
  let isDetecting = false;
  let detectionInterval = null;
  let alertAudio = null;
  let lastAlertTime = 0;
  const ALERT_COOLDOWN = 5000; // 5 seconds cooldown between alerts
  const DETECTION_INTERVAL = 2000; // 2 seconds
  const CONFIDENCE_THRESHOLD = 0.6;

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
        <h2 style="margin: 0; font-size: 14px; font-weight: 600; color: #F9FAFB;">Focus Detection</h2>
        <button id="close-focus-panel" style="background: transparent; border: none; color: #9CA3AF; cursor: pointer; font-size: 20px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 6px; transition: all 0.2s;">×</button>
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

        <div id="status-indicator" style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; background: #10B981; border-radius: 8px; transition: all 0.3s;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span style="font-size: 16px; font-weight: 600; color: white;">Focused</span>
        </div>

        <div id="detection-info" style="font-size: 11px; color: #6B7280; text-align: center;">
          Scanning every 2 seconds • Confidence threshold: 60%
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
      
      // Hide loading indicator
      const loading = panel?.querySelector('#camera-loading');
      if (loading) {
        loading.innerHTML = `
          <div style="text-align: center; color: #10B981;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 8px;">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div style="font-size: 12px;">Camera Ready</div>
          </div>
        `;
        setTimeout(() => {
          if (loading) loading.style.display = 'none';
        }, 1000);
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
      // Create a temporary video element to capture frame
      const video = document.createElement('video');
      video.srcObject = videoStream;
      video.autoplay = true;
      video.playsInline = true;
      
      // Wait for video to be ready
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });
      
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
      
      // Draw detections on canvas
      drawDetections(imageData, data.predictions || []);
      
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

  // Update status indicator
  function updateStatus(isFocused) {
    const indicator = panel?.querySelector('#status-indicator');
    if (!indicator) return;

    if (isFocused) {
      indicator.style.background = '#10B981';
      indicator.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span style="font-size: 16px; font-weight: 600; color: white;">Focused</span>
      `;
    } else {
      indicator.style.background = '#EF4444';
      indicator.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <span style="font-size: 16px; font-weight: 600; color: white;">Phone Detected!</span>
      `;
      
      playAlert();
      indicator.style.animation = 'pulse 0.5s ease-in-out 3';
    }
  }

  // Draw video frame with bounding boxes
  function drawDetections(imageData, predictions) {
    const canvas = panel?.querySelector('#detection-canvas');
    const loading = panel?.querySelector('#camera-loading');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onerror = () => {
      console.error('Failed to load image data');
    };
    
    img.onload = () => {
      // Hide loading indicator
      if (loading) loading.style.display = 'none';
      
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the image
      ctx.drawImage(img, 0, 0);
      
      // Draw bounding boxes for all predictions
      if (predictions && predictions.length > 0) {
        predictions.forEach(pred => {
          const { x, y, width, height, confidence, class: className } = pred;
          
          // Determine color based on confidence
          const isHighConfidence = confidence >= CONFIDENCE_THRESHOLD;
          const color = isHighConfidence ? '#EF4444' : '#FCD34D'; // Red for high, yellow for low
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
        
        // Update detection info
        const detectionInfo = panel?.querySelector('#detection-info');
        if (detectionInfo) {
          const highConfCount = predictions.filter(p => p.confidence >= CONFIDENCE_THRESHOLD).length;
          const lowConfCount = predictions.length - highConfCount;
          detectionInfo.textContent = `Detected: ${highConfCount} high confidence${lowConfCount > 0 ? `, ${lowConfCount} low confidence` : ''} • Threshold: 60%`;
        }
      } else {
        // Update detection info
        const detectionInfo = panel?.querySelector('#detection-info');
        if (detectionInfo) {
          detectionInfo.textContent = 'Scanning every 2 seconds • Confidence threshold: 60%';
        }
      }
    };
    
    img.src = imageData;
  }

  // Attach event listeners
  function attachEventListeners() {
    // Close button - turn off toggle
    panel.querySelector('#close-focus-panel').addEventListener('click', () => {
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
    const closeBtn = panel.querySelector('#close-focus-panel');
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.background = 'rgba(239, 68, 68, 0.1)';
      closeBtn.style.color = '#EF4444';
    });
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.background = 'transparent';
      closeBtn.style.color = '#9CA3AF';
    });
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
    console.log('Focus detection stopped');
  }

  // Make panel draggable
  function makeDraggable() {
    const header = panel.querySelector('#focus-header');
    let isDragging = false;
    let startX, startY, startLeft, startTop;

    header.addEventListener('mousedown', (e) => {
      if (e.target.id === 'close-focus-panel' || e.target.closest('#close-focus-panel')) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = panel.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      header.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      panel.style.left = (startLeft + dx) + 'px';
      panel.style.top = (startTop + dy) + 'px';
      panel.style.right = 'auto';
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        header.style.cursor = 'move';
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
