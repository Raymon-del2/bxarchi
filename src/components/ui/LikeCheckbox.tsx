'use client';

import { useState } from 'react';

interface LikeCheckboxProps {
  checked: boolean;
  onChange: () => void;
  count?: number;
}

export default function LikeCheckbox({ checked, onChange, count = 0 }: LikeCheckboxProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    onChange();
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center space-x-2 group transition-all duration-200"
    >
      <div className="relative">
        {/* Checkbox container */}
        <div
          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-300 ${
            checked
              ? 'bg-red-500 border-red-500 scale-110'
              : 'bg-white border-gray-300 group-hover:border-red-400'
          } ${isAnimating ? 'animate-pulse' : ''}`}
        >
          {/* Heart icon */}
          <svg
            className={`w-4 h-4 transition-all duration-300 ${
              checked ? 'text-white scale-100' : 'text-gray-400 scale-0'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Ripple effect */}
        {isAnimating && checked && (
          <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-75" />
        )}
      </div>

      {/* Count */}
      <span
        className={`text-sm font-medium transition-colors ${
          checked ? 'text-red-600' : 'text-gray-600 group-hover:text-red-500'
        }`}
      >
        {count}
      </span>
    </button>
  );
}
