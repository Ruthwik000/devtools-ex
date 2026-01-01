# Focus Detection - Background Processing Update

## Changes Made

Successfully moved Focus Detection to run in the **background service worker** so it continues running even when the popup is closed.

## Architecture

### Before (Popup-based)
```
Popup Component
├── Camera access
├── Frame capture
├── API calls
└── Detection logic
❌ Stops when popup closes
```

### After (Background-based)
```
Background Service Worker
├── Offscreen document (camera)
├── Frame capture loop
├── API calls
├── Detection logic
└── Notifications & alerts
✅ Runs continuously until manually stopped
```

## How It Works

### 1. Start Detection
- User clicks "Start Detection" in popup
- Popup sends message to background: `START_FOCUS_DETECTION`
- Background creates offscreen document for camera access
- Background starts detection loop (every 2 seconds)
- Popup shows local camera preview

### 2. Detection Running
- Background captures frames from offscreen camera
- Sends frames to Roboflow API
- If phone detected:
  - Shows browser alert on active tab
  - Sends browser notification
  - Notifies popup (if open) to update UI

### 3. Stop Detection
- User clicks "Stop Detection"
- Popup sends message to background: `STOP_FOCUS_DETECTION`
- Background stops detection loop
- Background closes offscreen document
- Popup stops local camera preview

## Files Modified

### 1. `src/background/service-worker.js`
Added:
- Focus detection state management
- `startFocusDetection()` function
- `stopFocusDetection()` function
- `detectMobilePhone()` function
- Message listeners for START/STOP/GET_STATUS
- Offscreen document management

### 2. `src/popup/components/FocusDetection.jsx`
Changed:
- Removed local detection loop
- Removed API calls from component
- Added background communication
- Added message listener for detection results
- Kept local camera preview for UI

### 3. `dist/offscreen.html` (NEW)
- Simple HTML for offscreen document
- Video and canvas elements

### 4. `dist/offscreen.js` (NEW)
- Camera access in offscreen context
- Frame capture function
- Message listener for CAPTURE_FRAME

## Message Flow

```
Popup → Background: START_FOCUS_DETECTION
Background → Offscreen: Create document
Background → Offscreen: CAPTURE_FRAME (every 2s)
Offscreen → Background: imageData
Background → Roboflow API: Detect phone
Background → Active Tab: alert() if detected
Background → System: Notification if detected
Background → Popup: FOCUS_DETECTION_RESULT (if open)
Popup → UI: Update status & bounding boxes
```

## Benefits

### ✅ Runs in Background
- Detection continues when popup is closed
- Detection continues when switching tabs
- Detection continues until manually stopped

### ✅ Better User Experience
- No need to keep popup open
- Can browse normally while being monitored
- Alerts appear on whatever tab is active

### ✅ Resource Efficient
- Single detection loop in background
- Offscreen document handles camera
- Popup only shows preview (optional)

## Testing

### Test Background Detection
1. Start detection in popup
2. Close the popup
3. Hold phone in front of camera
4. Alert should still appear! ✅
5. Notification should still appear! ✅

### Test Status Persistence
1. Start detection
2. Close popup
3. Reopen popup
4. Status should show "Focused" (detection running) ✅

### Test Stop
1. Start detection
2. Close popup
3. Reopen popup
4. Click "Stop Detection"
5. Detection should stop ✅

## Permissions Required

Already in manifest.json:
- ✅ `offscreen` - For offscreen document
- ✅ `notifications` - For browser notifications
- ✅ `scripting` - For alert() injection
- ✅ `activeTab` - For active tab access

## Known Limitations

### Camera Access
- Offscreen document requires camera permission
- Permission must be granted when starting detection
- Camera stays active until detection is stopped

### Resource Usage
- Camera active = battery drain
- API calls every 2 seconds = network usage
- Consider adjusting interval for battery life

## Future Enhancements

- [ ] Add battery-saving mode (longer intervals)
- [ ] Add detection schedule (only during work hours)
- [ ] Add statistics tracking
- [ ] Add focus session timer
- [ ] Add productivity reports
- [ ] Add sound alerts option

## Troubleshooting

### Detection Stops After Closing Popup
**Problem**: Detection doesn't continue in background
**Solution**: 
- Make sure you rebuilt the extension
- Reload the extension in chrome://extensions/
- Check background service worker console for errors

### No Alerts Appearing
**Problem**: Detection running but no alerts
**Solution**:
- Check if active tab allows script injection
- Some pages (chrome://, chrome-extension://) block scripts
- Try on a regular website like YouTube

### Camera Permission Issues
**Problem**: "Camera access denied"
**Solution**:
- Grant camera permission when prompted
- Check chrome://settings/content/camera
- Make sure system camera access is enabled

## Console Debugging

### Background Service Worker Console
```javascript
// Check if detection is running
chrome.runtime.sendMessage({ type: 'GET_FOCUS_STATUS' }, console.log);

// Should log: { isDetecting: true/false }
```

### Check Detection Logs
1. Go to chrome://extensions/
2. Click "service worker" under ExPro
3. Look for:
   - "Focus detection started in background"
   - "Mobile phone detected! Count: X"
   - "Focus detection stopped"

## Summary

Focus Detection now runs **completely in the background** using:
- Background service worker for detection logic
- Offscreen document for camera access
- Message passing for communication
- Browser alerts and notifications for user feedback

**Status**: ✅ BACKGROUND DETECTION WORKING

You can now:
1. Start detection
2. Close the popup
3. Browse normally
4. Get alerted when distracted
5. Stop detection anytime

The detection will continue running until you manually stop it! 🎉
