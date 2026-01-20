# Logos Folder

This folder contains logo images for various features in the ExPro Chrome Extension.

## Required Logo Files

### 1. YouTube Focus Mode Logo
**Filename:** `youtube-focus-logo.png` or `youtube-focus-logo.svg`

**Specifications:**
- **Size:** 48x48px minimum (recommended: 64x64px or higher for retina displays)
- **Format:** PNG with transparency or SVG
- **Colors:** Red (#EF4444 or #DC2626) to match YouTube branding
- **Shape:** Rounded square (border-radius: 6-12px)
- **Background:** Transparent
- **Icon Ideas:**
  - Eye icon (focus/watching)
  - Target/bullseye (focused attention)
  - Brain icon (concentration)
  - Zen/meditation symbol
  - Exclamation mark in circle (current design)

**Current:** Using inline SVG (red rounded square with white exclamation mark)

---

### 2. Learning Agent Logo
**Filename:** `learning-agent-logo.png` or `learning-agent-logo.svg`

**Specifications:**
- **Size:** 48x48px minimum (recommended: 64x64px or higher)
- **Format:** PNG with transparency or SVG
- **Colors:** Blue gradient (#3B82F6 to #2563EB) to match the UI theme
- **Shape:** Rounded square or circle
- **Background:** Transparent
- **Icon Ideas:**
  - Graduation cap (learning/education)
  - Book icon (knowledge)
  - Lightbulb (ideas/learning)
  - Brain with circuits (AI learning)
  - Chat bubble with sparkles (AI assistant)
  - Robot head (AI agent)

**Current:** Using inline SVG (sparkles/stars icon)

---

## How to Add Logos

### Step 1: Add Logo Files
Place your logo files in this `logos/` folder with the exact filenames:
- `youtube-focus-logo.png` (or .svg)
- `learning-agent-logo.png` (or .svg)

### Step 2: Update YouTube Focus Mode Code

Edit `src/content/features/focus-mode.js`:

Find the `.focus-mode-logo` div in the `createPanel()` function and replace:
```javascript
<div class="focus-mode-logo">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
  </svg>
</div>
```

With:
```javascript
<div class="focus-mode-logo">
  <img src="${browserAPI.runtime.getURL('logos/youtube-focus-logo.png')}" 
       alt="YouTube Focus" 
       style="width: 100%; height: 100%; object-fit: contain;">
</div>
```

### Step 3: Update Learning Agent Code

Edit `src/content/features/learning-agent-ui.js`:

Find the logo section in the header and replace the SVG with:
```javascript
<img src="${browserAPI.runtime.getURL('logos/learning-agent-logo.png')}" 
     alt="Learning Agent" 
     style="width: 24px; height: 24px; object-fit: contain;">
```

### Step 4: Rebuild
```bash
npm run build
```

The build system will automatically copy your logo files to the `dist/logos/` folder.

---

## Design Tips

### For PNG Files:
- Use transparent background
- Export at 2x or 3x resolution for retina displays (e.g., 96x96px or 144x144px)
- Optimize file size (keep under 50KB)
- Use PNG-8 if possible for smaller file size

### For SVG Files:
- Preferred format for scalability
- Keep the code clean and minimal
- Embed colors directly in the SVG
- Test at different sizes (16px, 32px, 48px, 64px)

### Color Palette:
- **YouTube Focus:** Red (#EF4444, #DC2626)
- **Learning Agent:** Blue (#3B82F6, #2563EB, #60A5FA)
- **Accent:** White (#FFFFFF) for contrast
- **Background:** Transparent

---

## Testing Your Logos

After adding logos and rebuilding:

1. **Load the extension** in Chrome (chrome://extensions/)
2. **Go to YouTube** and toggle on "YouTube Focus Mode"
3. **Minimize the panel** - you should see your custom logo
4. **Test Learning Agent** on any webpage
5. **Check different zoom levels** to ensure logos look crisp

---

## Other Feature Logos (Optional)

You can add logos for other features following the same pattern:
- `speed-control-logo.png` - Video Speed Control (clock icon)
- `color-finder-logo.png` - Color Finder (palette icon)
- `font-finder-logo.png` - Font Finder (typography icon)
- `focus-detection-logo.png` - Focus Detection (camera/eye icon)
- `github-agent-logo.png` - GitHub Agent (GitHub logo)

---

## Current Status

✅ Logos folder created  
✅ Build system configured  
✅ Manifest.json updated  
⏳ Waiting for logo files to be added  
⏳ Code updates needed after logos are added  

---

## Need Help?

If you need help creating logos:
- Use tools like Figma, Canva, or Adobe Illustrator
- Find free icons at: Heroicons, Feather Icons, Font Awesome
- Use AI tools like DALL-E or Midjourney for custom designs
- Keep it simple and recognizable at small sizes
