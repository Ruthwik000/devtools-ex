# Privacy Policy for DevTools Chrome Extension

**Last Updated:** February 7, 2026

## Introduction

DevTools ("we", "our", or "the extension") is committed to protecting your privacy. This Privacy Policy explains how our Chrome extension handles data and what information, if any, is collected when you use our extension.

## Data Collection and Usage

### What We DO NOT Collect

DevTools does **NOT** collect, store, transmit, or share any of the following:

- Personal information (name, email, address, phone number)
- Browsing history
- Website content or data
- User activity or behavior
- Location data
- Financial information
- Authentication credentials
- Any personally identifiable information (PII)

### What Data is Stored Locally

The extension stores the following data **locally on your device only** using Chrome's storage API:

1. **User Preferences**
   - Toggle states for enabled/disabled features
   - UI preferences and settings

2. **Tab Groups** (Tab Manager feature)
   - Saved tab group names
   - URLs and titles of tabs in saved groups
   - This data never leaves your device

3. **API Keys** (Optional AI Features)
   - Groq API keys for GitHub Agent and Learning Agent
   - Stored locally in Chrome's sync storage
   - Never transmitted to our servers (we don't have servers)
   - Only sent directly to Groq API when you use AI features

### How Features Work

#### Developer Tools (SEO, Cookies, Fonts, Colors)
- All analysis happens locally in your browser
- No data is sent to external servers
- Results are displayed only to you

#### Auto Clear Cache
- Uses Chrome's built-in API to clear cache
- No data collection involved

#### AI Features (GitHub Agent & Learning Agent)
- **Optional features** - disabled by default
- Require your own Groq API key
- When enabled, page content is sent directly to Groq API (not to us)
- We do not intercept, store, or have access to this data
- You control what data is sent by choosing when to use these features

#### Tab Manager
- All tab data stored locally on your device
- No synchronization with external servers
- You can delete saved groups at any time

## Third-Party Services

### Groq API (Optional)
If you choose to use the AI features (GitHub Agent or Learning Agent), you must provide your own Groq API key. When you use these features:

- Page content is sent directly from your browser to Groq's API
- We do not intercept or store this data
- Groq's privacy policy applies: https://groq.com/privacy-policy/
- You can disable these features at any time

### No Analytics or Tracking
- We do not use Google Analytics or any analytics service
- We do not track your usage
- We do not collect telemetry data
- We do not use cookies for tracking

## Permissions Explained

The extension requests the following permissions:

### storage
- **Purpose:** Save your preferences and tab groups locally
- **Data:** Toggle states, tab group data, API keys
- **Location:** Local device only

### tabs
- **Purpose:** Access tab information for Tab Manager and developer tools
- **Data:** Tab URLs and titles (only when you use Tab Manager)
- **Location:** Local device only

### browsingData
- **Purpose:** Clear cache when you use Auto Clear Cache feature
- **Data:** No data collected, only cache clearing
- **Location:** N/A

### cookies
- **Purpose:** View and edit cookies in Cookie Editor tool
- **Data:** Cookie data displayed to you only
- **Location:** Local device only

### declarativeNetRequest & declarativeNetRequestWithHostAccess
- **Purpose:** Optional ad blocking functionality
- **Data:** No data collected
- **Location:** N/A

### scripting
- **Purpose:** Inject UI overlays for developer tools
- **Data:** No data collected
- **Location:** N/A

### activeTab
- **Purpose:** Access current tab for analysis features
- **Data:** Analyzed locally, not transmitted
- **Location:** Local device only

### host_permissions (<all_urls>)
- **Purpose:** Provide developer tools on any website
- **Data:** No data collected or transmitted
- **Location:** N/A

## Data Security

- All data is stored locally using Chrome's secure storage APIs
- No data is transmitted to external servers (except Groq API when you explicitly use AI features)
- We do not have servers or databases
- We cannot access your data

## Your Rights and Control

You have complete control over your data:

- **View Data:** All data is stored locally in Chrome's storage
- **Delete Data:** Uninstall the extension to remove all local data
- **Disable Features:** Turn off any feature at any time
- **Export Data:** Tab groups can be restored as browser tabs
- **API Keys:** Delete your API keys from settings at any time

## Children's Privacy

DevTools does not knowingly collect any information from children under 13. The extension is designed for web developers and is not directed at children.

## Changes to Privacy Policy

We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last Updated" date. Continued use of the extension after changes constitutes acceptance of the updated policy.

## Open Source

DevTools is open source. You can review the code to verify our privacy practices:
- GitHub Repository: https://github.com/Ruthwik000/devtools-ex

## Contact

If you have questions about this Privacy Policy or the extension:

- **GitHub Issues:** https://github.com/Ruthwik000/devtools-ex/issues
- **Email:** : gruthwik44@gmail.com

## Compliance

This extension complies with:
- Chrome Web Store Developer Program Policies
- General Data Protection Regulation (GDPR)
- California Consumer Privacy Act (CCPA)
- Chrome Extension Manifest V3 requirements

## Summary

**In Plain English:**
- We don't collect your data
- Everything stays on your device
- AI features are optional and use your own API key
- You can delete everything by uninstalling
- We don't have servers or databases
- Your privacy is our priority

---

**DevTools Chrome Extension**  
Version 1.0.0  
© 2026 DevTools  
Licensed under MIT License
