# Dev Productivity Suite - Chrome Extension

A hackathon Chrome Extension (Manifest V3) with developer tools, learning utilities, and productivity features.

## 🏗️ Architecture

- **Popup UI**: React + Tailwind CSS control center
- **Background**: Service Worker for background tasks
- **Content Scripts**: Feature injection into web pages
- **Storage**: chrome.storage.sync for toggles, chrome.storage.local for data

## 🚀 Quick Start

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

## 📦 Features

### Developer Tools
- ✅ **Clear Cache** - Background-only cache clearing
- ✅ **Edit Cookie** - Floating panel to view/edit/delete cookies
- ✅ **Check SEO** - Basic SEO analysis overlay
- ✅ **Font Finder** - Hover to see font details
- ✅ **Color Finder** - Click to copy color values
- ✅ **GitHub File Tree** - VS Code-like sidebar for repository navigation with material icons
- 🔌 **GitHub Agent** - Integration hook (teammate implementation)
- 🔌 **AWS Agent** - Integration hook (teammate implementation)

### Learning Tools
- ✅ **Ad Blocker** - Declarative Net Request API
- ✅ **Speed Improver** - Defer images, lightweight UI
- ✅ **Learning Agent** - AI-powered page content analyzer with Groq API

### Productivity Tools
- ✅ **Focus Mode** - Hide distractions, dim page
- ✅ **Passive Watching Detector** - Inactivity detection with gentle prompts
- ✅ **Energy-Aware Scheduling** - Manual energy level selection with suggestions

### Storage
- 📊 **Repo Memory** - View and manage stored repos
- 📚 **Learning History** - Track learning activities
- 💾 **Saved Sessions** - Manage saved browser sessions
- 🗑️ **Clear All Data** - One-click data clearing

## 🔌 Integration Hooks

The extension provides placeholder hooks for agents:

```javascript
// GitHub Agent Hook
if (toggles.githubAgent && isGithubPage) {
  // GitHub Agent with chatbot UI and navigation
}

// GitHub File Tree Hook
if (toggles.githubFileTree && isGithubPage) {
  // VS Code-like sidebar showing repository structure
  // Features: collapsible folders, material icons, file navigation
}

// AWS Agent Hook
if (toggles.awsAgent && isAWSPage) {
  // AWS Agent will mount here
}

// Learning Agent Hook
if (toggles.learningAgent) {
  // Learning Agent - Universal page content analyzer
  // Uses Groq API to answer questions about any webpage
}
```

### Learning Agent Features
- 🤖 **AI-Powered Analysis**: Uses Groq's Llama 3.3 70B model
- 🌐 **Universal Support**: Works on any webpage
- 💬 **Floating Chat UI**: Beautiful, draggable chat interface
- 📄 **Smart Content Extraction**: Automatically extracts page content, headings, and metadata
- 🔑 **API Key Management**: Secure storage of Groq API key
- 🎨 **Modern Design**: Gradient purple theme with smooth animations

### GitHub File Tree Features
- 📁 **VS Code-Style Sidebar**: Familiar file explorer interface on the left side
- 🎨 **Material Icons**: Beautiful emoji-based icons for different file types
- 🔄 **Collapsible Folders**: Click folders to expand/collapse their contents
- 🗂️ **Smart Sorting**: Folders first, then files, alphabetically sorted
- 🎯 **Quick Navigation**: Click any file to navigate directly to it
- 🔍 **Full Repository Structure**: Shows the complete repo tree using GitHub API
- 💫 **Smooth Animations**: Polished transitions and hover effects
- 🌙 **Dark Theme**: Matches VS Code's dark theme aesthetic
- ◀️ **Collapsible Sidebar**: Hide/show the sidebar with a single click
- 🔄 **Refresh Button**: Reload the repository structure anytime

## 📁 Project Structure

```
├── manifest.json              # Extension manifest (MV3)
├── popup.html                 # Popup entry point
├── src/
│   ├── popup/                 # React popup UI
│   │   ├── Popup.jsx         # Main popup component
│   │   ├── components/       # Reusable UI components
│   │   └── sections/         # Feature sections
│   ├── background/           # Service worker
│   │   ├── service-worker.js
│   │   └── handlers/         # Background handlers
│   └── content/              # Content scripts
│       ├── content-script.js # Main content script
│       └── features/         # Feature implementations
├── rules/                    # DNR rules for ad blocking
└── vite.config.js           # Build configuration
```

## 🎯 Toggle System

All features are toggle-based and persist across sessions:

1. User toggles feature in popup
2. State saved to `chrome.storage.sync`
3. Background worker notified
4. Content scripts receive update
5. Feature activated/deactivated on page

## 🛠️ Development

```bash
# Development mode (watch)
npm run dev

# Production build
npm run build
```

## ✅ MVP Checklist

- [x] Manifest V3 setup
- [x] React + Tailwind popup UI
- [x] Toggle system with persistence
- [x] Background service worker
- [x] Content script injection
- [x] Clear Cache (working)
- [x] Font Finder (working)
- [x] Focus Mode (working)
- [x] Color Finder (working)
- [x] Edit Cookie (working)
- [x] Check SEO (working)
- [x] Ad Blocker (working)
- [x] Speed Improver (working)
- [x] Passive Watching Detector (working)
- [x] Energy-Aware Scheduling (working)
- [x] Storage UI (working)
- [x] Learning Agent with Groq API (working)
- [x] GitHub File Tree (working)
- [x] Integration hooks for GitHub/AWS agents

## 🎨 Design Principles

- Minimal, clean popup UI
- No heavy UI inside popup
- Real UI appears inside webpages
- Toggle-based feature control
- Professional, demo-friendly UX
