// Emergency script to clear Nuclear Mode storage
// Run this in the browser console if Nuclear Mode won't turn off

const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

console.log('🧹 EMERGENCY: Clearing Nuclear Mode storage...');

// Clear from local storage
browserAPI.storage.local.set({
  nuclearMode: {
    whitelist: [],
    timerEndTime: null,
    isActive: false
  }
}, () => {
  console.log('✅ Local storage cleared');
  
  // Verify
  browserAPI.storage.local.get('nuclearMode', (result) => {
    console.log('🔍 Verification:', result);
  });
});

// Clear from sync storage
browserAPI.storage.sync.set({
  passiveWatching: false
}, () => {
  console.log('✅ Sync storage cleared (passiveWatching = false)');
  
  // Verify
  browserAPI.storage.sync.get('passiveWatching', (result) => {
    console.log('🔍 Verification:', result);
  });
});

console.log('✅ Done! Now reload the page (F5)');
