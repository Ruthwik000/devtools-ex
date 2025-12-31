# GitHub Agent Quick Start Guide

## 🚀 Getting Started

### Prerequisites
1. **Backend API Running**
   - The GitHub Agent requires a backend API to be running
   - Default: `http://localhost:3000/api/v1`
   - Make sure your backend is running before using the feature

2. **Extension Installed**
   - Load the `dist/` folder in Chrome as an unpacked extension
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist/` folder

## 📖 How to Use

### Step 1: Navigate to GitHub
Open any GitHub repository in your browser, for example:
- `https://github.com/facebook/react`
- `https://github.com/microsoft/vscode`
- `https://github.com/your-username/your-repo`

### Step 2: Open ExPro Extension
Click the ExPro icon in your browser toolbar to open the popup.

### Step 3: Expand GitHub Agent
Click on the "GitHub Agent" section at the top of the popup to expand it.

### Step 4: Verify Connection
Check the connection status indicator:
- 🟢 **Green dot** = Connected to backend
- 🔴 **Red dot** = Not connected (check if backend is running)

### Step 5: Analyze Repository
1. Click the **"Analyze Repository"** button
2. Wait for the analysis to complete (30-60 seconds for large repos)
3. View the generated summary with repository information

### Step 6: Ask Questions
1. Switch to the **"Q&A"** tab
2. Type your question in the text area, for example:
   - "What does this repository do?"
   - "How do I install this project?"
   - "What are the main components?"
   - "Explain the authentication flow"
3. Optionally select a scope:
   - **Full Repository**: Search entire codebase
   - **Specific Folder**: Enter a path like `src/components`
4. Click **"Ask Question"**
5. View the AI-generated answer with source citations

## 💡 Example Questions

### General Questions
- "What is this project about?"
- "What are the main features?"
- "How do I get started?"
- "What dependencies does this use?"

### Technical Questions
- "How does authentication work?"
- "Explain the database schema"
- "What API endpoints are available?"
- "How is state management implemented?"

### Specific Questions
- "What does the UserController do?"
- "How are errors handled?"
- "What testing framework is used?"
- "Where is the configuration stored?"

## 🎨 UI Features

### Repository Info Card
Shows the current repository and branch you're viewing.

### Connection Status
Real-time indicator showing if the backend is reachable.

### Tab Navigation
- **Summary**: Repository overview and analysis
- **Q&A**: Ask questions about the codebase

### Source Citations
Each answer includes:
- Source file paths
- Relevance scores (percentage)
- Code snippets used to generate the answer

### Copy to Clipboard
Click the 📋 icon to copy summaries or answers.

## ⚙️ Configuration

### Change API URL
If your backend is running on a different URL:

1. Navigate to the chrome-extension folder
2. Open `options.html` in the extension
3. Enter your API URL
4. Click "Save Settings"

Or modify the default in `src/popup/sections/GitHubAgent.jsx`:
```javascript
const [apiUrl, setApiUrl] = useState('YOUR_API_URL_HERE');
```

## 🐛 Troubleshooting

### "Not connected" Status
**Problem**: Red dot showing "Not connected"
**Solution**: 
- Verify backend is running
- Check the API URL is correct
- Check browser console for errors

### "Not on a GitHub repo" Message
**Problem**: Can't see repository info
**Solution**:
- Make sure you're on a GitHub repository page
- URL should match: `https://github.com/owner/repo`
- Refresh the page and reopen the extension

### Analysis Takes Too Long
**Problem**: Repository analysis seems stuck
**Solution**:
- Large repositories can take 1-2 minutes
- Check backend logs for progress
- Refresh and try again if it exceeds 5 minutes

### No Answer Returned
**Problem**: Question submitted but no answer appears
**Solution**:
- Make sure repository was analyzed first
- Check if backend is still running
- Try a more specific question
- Check browser console for errors

## 🎯 Best Practices

### For Better Answers
1. **Be Specific**: "How does user authentication work?" vs "Tell me about auth"
2. **Use Context**: "In the API module, how are errors handled?"
3. **Ask One Thing**: Break complex questions into smaller ones
4. **Use Scope**: For large repos, narrow down to specific folders

### For Better Performance
1. **Analyze Once**: Repository analysis is cached
2. **Use Folder Scope**: Faster queries on large codebases
3. **Close Unused Tabs**: Reduces memory usage
4. **Clear Cache**: If repo has major updates, re-analyze

## 📊 Understanding Results

### Relevance Scores
- **90-100%**: Highly relevant, exact match
- **70-89%**: Very relevant, strong match
- **50-69%**: Moderately relevant
- **Below 50%**: May not be directly related

### Source Files
- Files are ranked by relevance
- Multiple sources = comprehensive answer
- Check sources to verify information

## 🔄 Workflow Example

```
1. Open GitHub repo: github.com/facebook/react
2. Click ExPro icon
3. Expand "GitHub Agent"
4. Click "Analyze Repository"
5. Wait for summary (shows React is a JavaScript library...)
6. Switch to "Q&A" tab
7. Ask: "How does the virtual DOM work?"
8. Review answer with source citations
9. Ask follow-up: "What is reconciliation?"
10. Copy answer to clipboard for notes
```

## 🎓 Learning Tips

Use GitHub Agent to:
- **Onboard to new projects** faster
- **Understand complex codebases** without reading everything
- **Find specific implementations** quickly
- **Learn from open source** projects
- **Document your own projects** by asking it to explain

## 🚦 Status Indicators

| Indicator | Meaning |
|-----------|---------|
| 🟢 Connected | Backend is reachable |
| 🔴 Not connected | Backend is down or unreachable |
| 🔄 Analyzing... | Repository analysis in progress |
| 🔄 Asking... | Question being processed |
| ⚠️ Error | Something went wrong (see message) |

## 📝 Notes

- Repository analysis is required before asking questions
- Analysis results are cached (no need to re-analyze)
- Questions are processed in real-time (not cached)
- All data is processed by your backend (privacy-friendly)
- No data is sent to third parties

## 🎉 You're Ready!

Start exploring repositories with AI-powered insights. Happy coding! 🚀
