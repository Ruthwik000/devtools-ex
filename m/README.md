# Focus Detection Chrome Extension

A Chrome extension that detects mobile phone usage via webcam using Roboflow's mobile phone detection model.

## Features

- Real-time webcam video capture
- Mobile phone detection every 2 seconds
- Visual status indicator (Focused/Distracted)
- Browser notifications when mobile phone is detected

## Installation

1. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select this folder

2. Grant camera permissions when prompted

## Usage

1. Click the extension icon in Chrome toolbar
2. Click "Start Detection" button
3. Allow camera access if prompted
4. The system will check for mobile phones every 2 seconds
5. Status will show "DISTRACTED" with alert if mobile phone detected

## API Configuration

The extension uses Roboflow's mobile phone detection API. Update the API key in `popup.js` if needed:
- API_KEY: Your Roboflow API key
- API_URL: Roboflow model endpoint
