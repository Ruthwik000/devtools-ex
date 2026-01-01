// Content script to show alerts on the main page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showAlert') {
    alert('⚠️ DISTRACTED! Mobile phone detected. Please stay focused!');
    sendResponse({ success: true });
  }
});
