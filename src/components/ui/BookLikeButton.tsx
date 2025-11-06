'use client';

import { useState } from 'react';

interface BookLikeButtonProps {
  liked: boolean;
  count: number;
  onToggle: () => void;
  disabled?: boolean;
}

export default function BookLikeButton({ liked, count, onToggle, disabled = false }: BookLikeButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    setIsAnimating(true);
    onToggle();
    setTimeout(() => setIsAnimating(false), 200);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className="relative cursor-pointer flex h-12 w-[136px] rounded-2xl border-none bg-[#1d1d1d] overflow-hidden shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.2),inset_2px_2px_5px_rgba(0,0,0,0.1),4px_4px_10px_rgba(0,0,0,0.4),-2px_-2px_8px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {/* Like section */}
      <div className="w-[70%] h-full flex cursor-pointer items-center justify-evenly">
        {/* Heart icon */}
        <svg
          className={`h-7 w-7 transition-all duration-200 ${
            liked 
              ? 'fill-[#fc4e4e]' 
              : 'fill-[#505050]'
          } ${isAnimating && liked ? 'animate-[enlarge_0.2s_ease-out]' : ''}`}
          viewBox="0 0 24 24"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>

        {/* Like text */}
        <span className="text-[#fcfcfc] text-base font-['Segoe_UI',Tahoma,Geneva,Verdana,sans-serif]">
          Like
        </span>
      </div>

      {/* Count section */}
      <div className="absolute right-0 w-[30%] h-full flex justify-center items-center border-l-2 border-[#4e4e4e] overflow-hidden">
        {/* Current count */}
        <span
          className={`absolute text-base transition-all duration-500 ease-out ${
            liked 
              ? 'text-[#fcfcfc] translate-y-0' 
              : 'text-[#717070] translate-y-0'
          }`}
        >
          {count}
        </span>
      </div>
    </button>
  );
}
