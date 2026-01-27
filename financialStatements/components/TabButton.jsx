import React from 'react';

/**
 * タブ切り替えボタン
 */
export const TabButton = ({ isActive, onClick, activeColor, children }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
      isActive
        ? `${activeColor} text-white shadow-lg`
        : 'bg-white text-gray-600 hover:bg-gray-100'
    }`}
  >
    {children}
  </button>
);
