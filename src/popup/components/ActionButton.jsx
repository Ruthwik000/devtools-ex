import React from 'react';

const ActionButton = ({ label, onClick, variant = 'primary' }) => {
  const baseClasses = "w-full py-2 px-3 rounded-md text-sm font-medium transition-colors";
  const variantClasses = {
    primary: "bg-[#6B5B95] text-white hover:bg-[#7B6BA5]",
    secondary: "bg-[#44444E] text-gray-200 hover:bg-[#555560]",
    danger: "bg-red-600 text-white hover:bg-red-700"
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {label}
    </button>
  );
};

export default ActionButton;
