# Nuclear Mode - Complete Functionality Guide

## Overview
Nuclear Mode is an extreme focus tool that blocks ALL websites except your whitelist for a set time period. Once activated, it **CANNOT be stopped** until the timer expires.

## How It Works

### 1. Setup Phase
1. **Open ExPro popup** → Toggle "Nuclear Mode" ON
2. **Add websites to whitelist**:
   - Type domain (e.g., `google.com`) and click "Add" or press Enter
   - OR click "Add Current Site" to whitelist the current page
   - Add all sites you need to work on
3. **Set timer**:
   - Quick presets: 15m, 30m, 1h, 2h
   - OR enter custom minutes
4. **Click "Activate Nuclear Mode"**

### 2. Active Phase (UNSTOPPABLE)

#### What Happens:
- ✅ **Floating timer appears on ALL tabs** (top-right corner)
  - Shows countdown in MM:SS format
  - Red border and pulsing effect when < 5 minutes
  - Draggable and resizable
  - Visible on whitelisted AND blocked sites

- 🔒 **ALL non-whitelisted sites are blocked**:
  - Shows full-screen block page with timer
  - Lists your whitelisted sites
  - Cannot be closed or bypassed

- 🚫 **New tabs to non-whitelisted sites are auto-closed**
  - Background service worker monitors all new tabs
  - Closes them immediately if not whitelisted

- ⚠️ **Browser close warning**:
  - Trying to close browser/tab shows warning
  - Reminds you how much time is left

- 🔐 **Keyboard shortcuts blocked**:
  - F12, Ctrl+Shift+I, Ctrl+W, Ctrl+T, Alt+F4
  - Prevents escape attempts

#### What You CAN Do:
- ✓ Browse any whitelisted site freely
- ✓ Switch between whitelisted sites
- ✓ Open new tabs to whitelisted sites
- ✓ See timer countdown on all tabs

#### What You CANNOT Do:
- ✗ Stop the timer
- ✗ Close the floating timer
- ✗ Access non-whitelisted sites
- ✗ Open DevTools (F12 blocked)
- ✗ Disable the extension (requires timer to expire first)

### 3. Completion Phase
- Timer reaches 0:00
- All blocks are automatically removed
- Floating timer disappears
- Full browser access restored
- Nuclear Mode toggle turns OFF

## Use Cases

### Deep Work Session
```
Whitelist: docs.google.com, github.com, stackoverflow.com
Timer: 2 hours
Result: Focused coding session, no distractions
```

### Study Session
```
Whitelist: coursera.org, notion.so, wikipedia.org
Timer: 1 hour
Result: Uninterrupted learning
```

### Writing Session
```
Whitelist: docs.google.com, grammarly.com
Timer: 30 minutes
Result: Distraction-free writing
```

## Technical Details

### Cross-Tab Synchronization
- Uses `chrome.storage.local` for state persistence
- Background service worker coordinates all tabs
- Message passing keeps all tabs in sync
- Floating timer appears on every tab automatically

### Site Blocking
- Blocks at navigation level (before page loads)
- Closes non-whitelisted tabs immediately
- Shows custom block page with timer
- Prevents all escape attempts

### Timer Persistence
- Survives page refreshes
- Survives browser restart (if timer not expired)
- Stored in local storage with end timestamp
- Updates every second across all tabs

## Tips

1. **Test first**: Try 15-minute session to understand how it works
2. **Plan ahead**: Add ALL sites you'll need before activating
3. **Set realistic timers**: Start with shorter sessions (30-60 min)
4. **Emergency**: If you MUST stop, wait for timer or restart computer
5. **Whitelist carefully**: Include docs, tools, and reference sites

## Warnings

⚠️ **CANNOT BE STOPPED**: Once activated, you're locked in until timer expires

⚠️ **Plan bathroom breaks**: Set timer accordingly

⚠️ **Emergency access**: Only way to stop is waiting or restarting computer

⚠️ **Test whitelist**: Make sure you have all needed sites before activating

## Troubleshooting

**Timer not showing on all tabs?**
- Reload the extension
- Refresh all open tabs
- Check console for errors

**Site not being blocked?**
- Check if it's in whitelist
- Verify Nuclear Mode is active (timer visible)
- Check background service worker logs

**Can't add sites to whitelist?**
- Check browser console (F12) for errors
- Try "Add Current Site" button instead
- Verify input format (just domain, no http://)

**Timer stuck or not counting?**
- Check system time is correct
- Reload extension
- Deactivate and reactivate Nuclear Mode

---

**Built with ExPro Chrome Extension**
