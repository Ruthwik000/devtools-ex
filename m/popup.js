const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const statusDiv = document.getElementById('status');
const toggleBtn = document.getElementById('toggleBtn');

let isDetecting = false;
let localStream = null;

// Check status on load
chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
  if (response && response.isDetecting) {
    isDetecting = true;
    toggleBtn.textContent = 'Stop Detection';
    statusDiv.textContent = '🔍 Detection Running in Background';
    statusDiv.className = 'focused';
    startLocalVideo();
  }
});

// Listen for detection results
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'detectionResult') {
    const count = request.predictions.length;
    statusDiv.textContent = `⚠️ DISTRACTED - ${count} Mobile Phone(s) Detected!`;
    statusDiv.className = 'distracted';
    
    // Draw bounding boxes
    drawBoundingBoxes(request.predictions);
    
    // Reset status after delay
    setTimeout(() => {
      if (isDetecting) {
        statusDiv.textContent = '✓ Status: Focused';
        statusDiv.className = 'focused';
      }
    }, 1500);
  }
});

async function startLocalVideo() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ 
      video: { width: 640, height: 480 } 
    });
    video.srcObject = localStream;
    
    video.addEventListener('loadedmetadata', () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      updateCanvas();
    });
  } catch (error) {
    console.error('Camera error:', error);
  }
}

function updateCanvas() {
  if (!isDetecting || !localStream) return;
  if (video.videoWidth > 0) {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  }
  requestAnimationFrame(updateCanvas);
}

function drawBoundingBoxes(predictions) {
  if (video.videoWidth === 0) return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  predictions.forEach(prediction => {
    const { x, y, width, height, confidence, class: className } = prediction;
    
    const boxX = x - width / 2;
    const boxY = y - height / 2;
    
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 3;
    ctx.strokeRect(boxX, boxY, width, height);
    
    const label = `${className} ${(confidence * 100).toFixed(1)}%`;
    ctx.font = '16px Arial';
    const textWidth = ctx.measureText(label).width;
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(boxX, boxY - 25, textWidth + 10, 25);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, boxX + 5, boxY - 7);
  });
  
  // Resume normal canvas updates after 1.5 seconds
  setTimeout(() => {
    if (isDetecting) {
      updateCanvas();
    }
  }, 1500);
}

toggleBtn.addEventListener('click', async () => {
  if (!isDetecting) {
    // Start detection
    chrome.runtime.sendMessage({ action: 'startDetection' }, async (response) => {
      if (response && response.success) {
        isDetecting = true;
        toggleBtn.textContent = 'Stop Detection';
        statusDiv.textContent = '🔍 Detection Running in Background';
        statusDiv.className = 'focused';
        
        await startLocalVideo();
        
        if (Notification.permission === 'default') {
          Notification.requestPermission();
        }
      }
    });
  } else {
    // Stop detection
    chrome.runtime.sendMessage({ action: 'stopDetection' }, (response) => {
      if (response && response.success) {
        isDetecting = false;
        toggleBtn.textContent = 'Start Detection';
        statusDiv.textContent = 'Status: Stopped';
        statusDiv.className = '';
        
        if (localStream) {
          localStream.getTracks().forEach(track => track.stop());
          localStream = null;
        }
        video.srcObject = null;
      }
    });
  }
});
