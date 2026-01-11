// Focus Detection - Webcam-based focus monitoring
export function initFocusDetection() {
  const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
  
  let panel = null;
  let videoStream = null;
  let isDetecting = false;
  let detectionInterval = null;

  // Create floating webcam panel
  function createPanel() {
    panel = document.createElement('div');
    panel.id = 'focus-detection-panel';
    panel.style.cssText = `
      position: fixed; top: 80px; right: 20px; width: 350px; min-height: 380px;
      background: linear-gradient(135deg, #1F2937 0%, #111827 100%);
      border-radius: 16px; border: 1px solid #374151;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6); z-index: 9999998;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #E5E7EB; overflow: hidden; display: flex; flex-direction: column;
      resize: both; min-width: 300px; min-height: 320px;
    `;

    panel.innerHTML = `
      <div id="focus-header" style="background: linear-gradient(135deg, #374151 0%, #1F2937 100%); padding: 16px 20px; cursor: move; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #374151; user-select: none;">
        <h2 style="margin: 0; font-size: 16px; font-weight: 600; color: #F9FAFB;">Focus Detection</h2>
        <button id="close-focus-panel" style="background: transparent; border: none; color: #9CA3AF; cursor: pointer; font-size: 24px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 6px; transition: all 0.2s;">×</button>
      </div>

      <div style="padding: 16px; flex: 1; display: flex; flex-direction: column;">
        <p style="font-size: 13px; color: #9CA3AF; margin: 0 0 16px 0;">Detect mobile phone usage via webcam every 2 seconds</p>
        
        <div style="position: relative; width: 100%; aspect-ratio: 4/3; background: #000; border-radius: 12px; overflow: hidden;">
          <video id="focus-video" autoplay playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>
          <canvas id="focus-canvas" style="display: none;"></canvas>
          <div id="camera-placeholder" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #1F2937;">
            <div style="text-align: center; color: #6B7280;">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 12px;">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <div style="font-size: 14px;">Camera Off</div>
            </div>
          </div>
        </div>
      </div>

      <div id="resize-handle-focus" style="position: absolute; bottom: 0; right: 0; width: 20px; height: 20px; cursor: nwse-resize; background: linear-gradient(135deg, transparent 50%, #374151 50%); border-radius: 0 0 16px 0;"></div>
    `;

    document.body.appendChild(panel);
    attachEventListeners();
    makeDraggable();
    makeResizable();
    startWebcam();
  }

  // Start webcam
  async function startWebcam() {
    try {
      videoStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 },
        audio: false 
      });
      
      const video = panel.querySelector('#focus-video');
      const placeholder = panel.querySelector('#camera-placeholder');
      
      if (video && videoStream) {
        video.srcObject = videoStream;
        placeholder.style.display = 'none';
        isDetecting = true;
        startDetection();
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
      alert('Could not access webcam. Please grant camera permissions.');
    }
  }

  // Start detection loop
  function startDetection() {
    detectionInterval = setInterval(() => {
      if (isDetecting) {
        // Simplified detection - in production, use TensorFlow.js with YOLO
        detectPhoneUsage();
      }
    }, 2000);
  }

  // Detect phone usage (simplified - would use YOLO model in production)
  function detectPhoneUsage() {
    // This is a placeholder - real implementation would use TensorFlow.js
    // For now, randomly simulate detection for demo purposes
    const isFocused = Math.random() > 0.3; // 70% focused
    updateStatus(isFocused);
  }

  // Update status indicator
  function updateStatus(isFocused) {
    const indicator = panel.querySelector('#status-indicator');
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
    }
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
    if (detectionInterval) clearInterval(detectionInterval);
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      videoStream = null;
    }
    
    // Notify background to stop
    browserAPI.runtime.sendMessage({ action: 'stopDetection' });
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

  // Make panel resizable
  function makeResizable() {
    const handle = panel.querySelector('#resize-handle-focus');
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
      panel.style.width = Math.max(350, startWidth + dx) + 'px';
      panel.style.height = Math.max(450, startHeight + dy) + 'px';
    });

    document.addEventListener('mouseup', () => {
      isResizing = false;
    });
  }

  // Initialize
  createPanel();

  // Notify background to start detection
  browserAPI.runtime.sendMessage({ action: 'startDetection' });

  return {
    cleanup: () => {
      stopDetection();
      if (panel) panel.remove();
    }
  };
}
