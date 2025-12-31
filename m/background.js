let isDetecting = false;
let detectionInterval = null;
const API_KEY = 'dnJH9C8BFgg1vaBXQaz1';
const API_URL = 'https://serverless.roboflow.com/mobile-phone-detection-2vads/1';
const DETECTION_INTERVAL = 2000;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startDetection') {
    startDetection();
    sendResponse({ success: true, isDetecting: true });
  } else if (request.action === 'stopDetection') {
    stopDetection();
    sendResponse({ success: true, isDetecting: false });
  } else if (request.action === 'getStatus') {
    sendResponse({ isDetecting });
  } else if (request.action === 'captureFrame') {
    // Forward to offscreen document
    chrome.runtime.sendMessage(request).then(sendResponse);
    return true;
  }
  return true;
});

async function startDetection() {
  if (isDetecting) return;
  
  isDetecting = true;
  
  // Create offscreen document for camera
  try {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['USER_MEDIA'],
      justification: 'Camera access for mobile phone detection'
    });
  } catch (error) {
    if (!error.message.includes('Only a single offscreen')) {
      console.error('Error creating offscreen document:', error);
    }
  }
  
  // Wait a bit for camera to initialize
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  detectionInterval = setInterval(async () => {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'captureFrame' });
      if (response && response.imageData) {
        await detectMobilePhone(response.imageData);
      }
    } catch (error) {
      console.error('Detection loop error:', error);
    }
  }, DETECTION_INTERVAL);
}

function stopDetection() {
  isDetecting = false;
  if (detectionInterval) {
    clearInterval(detectionInterval);
    detectionInterval = null;
  }
  
  chrome.offscreen.closeDocument().catch(() => {});
}

async function detectMobilePhone(imageBase64) {
  try {
    const response = await fetch(`${API_URL}?api_key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: imageBase64
    });
    
    const data = await response.json();
    console.log('API Response:', data);
    
    if (data.predictions && data.predictions.length > 0) {
      // Show alert on active tab
      try {
        const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        if (tabs[0]) {
          await chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: () => {
              alert('⚠️ DISTRACTED! Mobile phone detected. Please stay focused!');
            }
          });
        }
      } catch (error) {
        console.error('Error showing alert:', error);
      }
      
      // Show notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        title: 'Focus Alert!',
        message: `${data.predictions.length} mobile phone(s) detected!`
      });
      
      // Notify popup if open
      chrome.runtime.sendMessage({
        action: 'detectionResult',
        predictions: data.predictions
      }).catch(() => {});
    }
  } catch (error) {
    console.error('Detection error:', error);
  }
}
