const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let stream = null;
let cameraReady = false;

// Start camera
async function startCamera() {
  console.log('Offscreen: Requesting camera access...');
  try {
    stream = await navigator.mediaDevices.getUserMedia({ 
      video: { width: 640, height: 480 } 
    });
    console.log('Offscreen: Camera access granted!');
    video.srcObject = stream;
    
    video.addEventListener('loadedmetadata', () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      cameraReady = true;
      console.log('Offscreen: Camera ready, dimensions:', video.videoWidth, 'x', video.videoHeight);
    });
  } catch (error) {
    console.error('Offscreen: Camera error -', error.name, ':', error.message);
    if (error.name === 'NotAllowedError') {
      console.error('Offscreen: Camera permission denied by user');
    } else if (error.name === 'NotFoundError') {
      console.error('Offscreen: No camera found');
    } else if (error.name === 'NotReadableError') {
      console.error('Offscreen: Camera is already in use');
    }
  }
}

// Stop camera and release tracks
function stopCamera() {
  console.log('Offscreen: Stopping camera...');
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  if (video) {
    video.srcObject = null;
  }
  cameraReady = false;
}

// Capture frame
function captureFrame() {
  if (!cameraReady || video.videoWidth === 0) {
    console.log('Offscreen: Camera not ready yet, videoWidth:', video.videoWidth);
    return null;
  }
  
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.8);
}

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'captureFrame') {
    const imageData = captureFrame();
    if (imageData) {
      console.log('Offscreen: Frame captured successfully');
    } else {
      console.log('Offscreen: Failed to capture frame');
    }
    sendResponse({ imageData });
  }
  if (request.action === 'stopCamera') {
    stopCamera();
    sendResponse({ stopped: true });
  }
  return true;
});

// Start camera on load
console.log('Offscreen: Document loaded, starting camera...');
startCamera();
