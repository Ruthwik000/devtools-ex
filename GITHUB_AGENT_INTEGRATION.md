# GitHub Agent Integration

## Overview
The GitHub Agent feature has been successfully integrated into the main ExPro extension with a modern, dark-themed UI that matches the extension's design system.

## Features

### 1. Repository Analysis
- Automatically detects when you're on a GitHub repository page
- Analyzes the entire repository and creates embeddings for intelligent search
- Displays repository summary with key information from README and documentation

### 2. Q&A System
- Ask natural language questions about the repository
- Get AI-powered answers based on the actual codebase
- View source files that were used to generate the answer
- Support for full repository or folder-specific queries

### 3. Smart Scope Selection
- **Full Repository**: Search across the entire codebase
- **Specific Folder**: Narrow down queries to a particular directory (e.g., `src/components`)

## UI Design

### Color Scheme
The GitHub Agent uses the same dark theme as the main extension:
- **Background**: Gray-900 (#111827)
- **Surface**: Gray-800 (#1f2937) and Gray-750 (#2d3748)
- **Primary**: Blue-600 (#2563eb)
- **Text**: Gray-100 to Gray-500 for hierarchy
- **Borders**: Gray-700 (#374151)

### Components
- **Repository Info Card**: Shows current repo and branch with GitHub-style icons
- **Connection Status**: Real-time indicator of backend connectivity
- **Tab Navigation**: Clean tabs for Summary and Q&A sections
- **Loading States**: Animated spinners for async operations
- **Error Handling**: Prominent error messages with clear styling
- **Source Citations**: Expandable source files with relevance scores

## Backend Configuration

The GitHub Agent connects to a backend API (default: `http://localhost:3000/api/v1`).

### API Endpoints Used:
- `GET /health` - Check backend connectivity
- `POST /ingest` - Start repository analysis
- `GET /status/:jobId` - Poll analysis progress
- `POST /query` - Ask questions about the repository

### Configuration
Users can configure the API URL through the extension's options page (accessible via the settings button in the chrome-extension folder's popup).

## File Structure

```
src/popup/
├── sections/
│   ├── GitHubAgent.jsx       # Main GitHub Agent component
│   ├── DeveloperTools.jsx    # Updated (removed old GitHub Agent toggle)
│   └── ...
├── components/
│   ├── Section.jsx           # Reusable section wrapper
│   └── Toggle.jsx            # Toggle switch component
├── Popup.jsx                 # Main popup (updated with GitHub Agent)
└── index.css                 # Updated with GitHub Agent styles
```

## Key Differences from Chrome-Extension Version

### Improvements:
1. **Dark Theme**: Matches the main extension's color scheme
2. **Better Integration**: Uses existing Section/Toggle components
3. **Cleaner Layout**: More compact and organized
4. **Consistent Styling**: Follows Tailwind CSS patterns used throughout
5. **Removed Redundancy**: Eliminated the simple toggle in favor of full feature

### Maintained Features:
- All core functionality from the chrome-extension version
- Repository detection and analysis
- Q&A with source citations
- Scope selection (full repo vs. folder)
- Connection status monitoring
- Error handling and loading states

## Usage

1. **Navigate to a GitHub Repository**
   - Open any GitHub repository page in your browser

2. **Open ExPro Extension**
   - Click the ExPro icon in your browser toolbar

3. **Expand GitHub Agent Section**
   - Click on "GitHub Agent" to expand the section

4. **Analyze Repository**
   - Click "Analyze Repository" to start the analysis
   - Wait for the backend to process the repository
   - View the generated summary

5. **Ask Questions**
   - Switch to the "Q&A" tab
   - Type your question in the text area
   - Optionally select a specific folder scope
   - Click "Ask Question" to get an AI-powered answer
   - Review sources used to generate the answer

## Technical Implementation

### State Management
- Uses React hooks (useState, useEffect) for local state
- Chrome Storage API for persistent settings
- Real-time polling for long-running operations

### API Communication
- Fetch API with proper error handling
- Timeout handling for slow connections
- Retry logic for backend cold starts (Render free tier)

### GitHub URL Parsing
- Regex-based extraction of owner, repo, and branch
- Handles various GitHub URL formats
- Graceful fallback when not on GitHub

## Future Enhancements

Potential improvements:
- [ ] File tree explorer (like in chrome-extension version)
- [ ] Query history with local storage
- [ ] Keyboard shortcuts (Ctrl+Enter to submit)
- [ ] Export answers to markdown
- [ ] Repository comparison feature
- [ ] Code snippet highlighting in answers
- [ ] Settings panel for API configuration within main extension

## Notes

- The old "GitHub Agent" toggle in Developer Tools has been removed
- The feature is now a standalone section at the top of the popup
- Backend must be running for the feature to work
- Repository analysis can take 30-60 seconds for large repos
