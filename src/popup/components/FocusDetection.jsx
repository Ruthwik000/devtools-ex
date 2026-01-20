import React from 'react';

const FocusDetection = () => {
  return (
    <div className="mt-3 pt-3 border-t border-gray-700 space-y-3">
      <div className="text-xs text-gray-400">
        Detects mobile phone usage via webcam every 2 seconds
      </div>

      {/* Info Box */}
      <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3 text-xs text-blue-200">
        <div className="font-semibold mb-1">📹 Detection Panel</div>
        <div>A floating panel with camera preview will appear on the page when enabled.</div>
      </div>

      {/* Features */}
      <div className="text-xs text-gray-400 space-y-1">
        <div>✓ AI-powered phone detection (Roboflow)</div>
        <div>✓ Real-time video feed with bounding boxes</div>
        <div>✓ 45% confidence threshold</div>
        <div>✓ Alert sound on detection</div>
      </div>
    </div>
  );
};

export default FocusDetection;
