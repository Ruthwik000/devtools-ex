const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const statusOverlay = document.getElementById('statusOverlay');

let localStream = null;

// Start video preview
async function startVideoPreview() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ 
      video: { width: 640, height: 480 } 
    });
    video.srcObject = localStream;
    
    video.addEventListener('loadedmetadata', () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    });
  } catch (error) {
    console.error('Camera error:', error);
    statusOverlay.textContent = '❌ Camera access denied';
    statusOverlay.className = 'distracted';
  }
}

// Capture frame from video
function captureFrame() {
  console.log('captureFrame called, video dimensions:', video.videoWidth, 'x', video.videoHeight);
  
  if (video.videoWidth === 0) {
    console.log('Video not ready yet');
    return null;
  }
  
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = video.videoWidth;
  tempCanvas.height = video.videoHeight;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.drawImage(video, 0, 0);
  const imageData = tempCanvas.toDataURL('image/jpeg', 0.8);
  console.log('Frame captured, data length:', imageData.length);
  return imageData;
}

// Draw bounding boxes
function drawBoundingBoxes(predictions) {
  canvas.style.display = 'block';
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  if (predictions && predictions.length > 0) {
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
  }
}

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Video window received message:', request.action);
  
  if (request.action === 'captureFrame') {
    const imageData = captureFrame();
    console.log('Sending frame response, has data:', !!imageData);
    sendResponse({ imageData });
  } else if (request.action === 'detectionResult') {
    console.log('Detection result received:', request.predictions);
    const count = request.predictions.length;
    statusOverlay.textContent = `⚠️ DISTRACTED - ${count} Mobile Phone(s) Detected!`;
    statusOverlay.className = 'distracted';
    drawBoundingBoxes(request.predictions);
    
    // Clear boxes after 1.5 seconds
    setTimeout(() => {
      canvas.style.display = 'none';
      statusOverlay.textContent = '✓ Status: Focused';
      statusOverlay.className = 'focused';
    }, 1500);
  } else if (request.action === 'stopVideo') {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      localStream = null;
    }
    window.close();
  }
  return true;
});

// Start video on load
startVideoPreview();
