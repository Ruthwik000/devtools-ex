# DevTools - Chrome Extension

A Chrome Extension (Manifest V3) providing developer tools and utilities through a minimal popup with rich in-page UIs.

## Quick Start

```bash
# Install dependencies
npm install

# Build extension
npm run build

# Load in Chrome
1. Open chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder
```

## Architecture

- **Popup**: React + Tailwind control center (minimal UI)
- **Background**: Service worker for message routing and background tasks
- **Content Scripts**: Feature injection with floating panels in web pages
- **Storage**: chrome.storage.sync for toggles, chrome.storage.local for data

## Features

### Developer Tools
- **Auto Clear Cache** - Automatically clear cache on page refresh
- **Edit Cookie** - Floating panel to view/edit/delete cookies with search and filtering
- **Check SEO** - Basic SEO analysis overlay with meta tags and heading structure
- **Font Finder** - Hover to see font details with copy functionality
- **Color Finder** - Professional color picker with eyedropper, history, and webpage analyzer
- **GitHub Agent** - AI-powered GitHub repository assistant with chatbot UI (Groq API)
- **Learning Agent** - AI assistant to answer questions about any page (Groq API)

### Tab Manager
- **Save Tab Groups** - Collect and save current tabs with a custom name
- **Restore Tab Groups** - Restore saved tab groups with one click
- **Manage Groups** - View, delete, and organize saved tab groups
- **Select Tabs** - Choose which tabs to save in a group

## Key Features Detail

### Color Finder
- Professional color picker with multiple modes
- Eyedropper tool to pick colors from any webpage
- Color format conversion (HEX, RGB, HSL, HSV, CMYK)
- Color history with 50-color storage
- Webpage color analyzer to extract all colors from current page
- Clean, professional UI with muted color palette

### Learning Agent
- AI assistant to answer questions about any page
- Works on any webpage with smart content extraction
- Floating, draggable chat interface
- Secure API key storage in chrome.storage.sync
- Positioned at bottom-right for easy access
- Powered by Groq API (llama-3.3-70b-versatile)

### GitHub Agent
- AI-powered GitHub repository assistant
- Analyzes repository structure, files, and issues
- Floating chatbot UI with markdown support
- Context-aware responses about current GitHub page
- Groq API integration for intelligent responses
- Draggable and resizable interface

### Tab Manager
- Save current open tabs as named groups
- Select specific tabs to include in a group
- Restore all tabs from a saved group with one click
- View tab previews with favicons and titles
- Delete individual groups or clear all groups
- Persistent storage of tab groups across sessions

## Project Structure

```
├── src/
│   ├── popup/              # React popup UI (Vite build)
│   │   ├── Popup.jsx       # Main component
│   │   ├── components/     # Reusable components
│   │   └── sections/       # Feature sections
│   ├── background/         # Service worker
│   │   ├── service-worker.js
│   │   └── handlers/       # Background handlers
│   └── content/            # Content scripts
│       ├── content-script.js       # Source
│       ├── content-bundle.js       # Bundled output
│       └── features/               # Feature implementations
├── rules/                  # Declarative Net Request rules
├── icons/                  # Extension icons
├── logos/                  # Feature logos
├── dist/                   # Build output
├── manifest.json           # Extension manifest (MV3)
├── build.js                # Post-build script
├── bundle-content.js       # Content script bundler
└── vite.config.js          # Vite configuration
```

## Toggle System

All features use a toggle-based control system with persistence:

1. User toggles feature in popup (React component)
2. State saved to `chrome.storage.sync` (toggles object)
3. Background worker receives `TOGGLE_CHANGED` message
4. Background broadcasts `TOGGLE_UPDATE` to all content scripts
5. Content script calls `handleFeatureToggle(key, value)`
6. Feature initialized or cleaned up based on state

## Development

```bash
# Install dependencies
npm install

# Development mode (watch)
npm run dev

# Production build
npm run build

# Bundle content scripts only
npm run bundle
```

### Build Process

1. `bundle-content.js` - Bundles all content script features into single file
2. `vite build` - Builds React popup UI
3. `build.js` - Copies manifest, icons, rules, logos to `dist/`

### Tech Stack

- React 18.2.0 + Tailwind CSS 3.4.0
- Vite 5.0.8 (build tool)
- Chrome Extension Manifest V3
- External APIs: Groq (AI)

## Design Principles

- **Minimal popup UI** - Clean control center, no heavy interfaces in popup
- **Rich in-page UIs** - Floating panels injected into web pages
- **Toggle-based control** - Simple on/off switches with persistence
- **Professional styling** - Dark theme with muted, professional color palette
- **Cross-browser compatible** - Works on Chrome and Firefox
- **Privacy-focused** - All data stored locally, no tracking
- **Draggable & Resizable** - All floating panels can be moved and resized
