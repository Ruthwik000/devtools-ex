import React from 'react';
import Section from '../components/Section';
import Toggle from '../components/Toggle';
import FocusDetection from '../components/FocusDetection';

const ProductivityTools = ({ expanded, onToggle, toggles, onToggleChange }) => {
  return (
    <Section title="Productivity Tools" expanded={expanded} onToggle={onToggle}>
      <Toggle
        label="YouTube Focus Mode"
        description="Remove distractions, block shorts"
        enabled={toggles.focusMode || false}
        onChange={(val) => onToggleChange('focusMode', val)}
      />
      
      <Toggle
        label="Focus Detection"
        description="Detect mobile phone usage via webcam"
        enabled={toggles.focusDetection || false}
        onChange={(val) => onToggleChange('focusDetection', val)}
      />

      {/* Focus Detection UI - Only show when enabled */}
      {toggles.focusDetection && <FocusDetection />}
      
      <Toggle
        label="Nuclear Mode"
        description="Block non-whitelisted sites with timer"
        enabled={toggles.nuclearMode || false}
        onChange={(val) => onToggleChange('nuclearMode', val)}
      />
    </Section>
  );
};

export default ProductivityTools;
