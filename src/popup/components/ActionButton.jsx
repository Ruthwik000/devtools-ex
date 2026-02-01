import React from 'react';

const ActionButton = ({ label, onClick, variant = 'primary' }) => {
  const baseClasses = "w-full py-2 px-3 rounded-md text-sm font-medium transition-colors";
  const variantClasses = {
    primary: "bg-primary text-white hover:bg-primary-hover",
    secondary: "bg-slate-700 text-slate-100 hover:bg-slate-600",
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
