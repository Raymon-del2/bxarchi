'use client';

import { useState, useRef, useEffect } from 'react';
import { emojiCategories, searchEmojis } from '@/lib/emojis';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

export default function EmojiPicker({ onEmojiSelect, onClose }: EmojiPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(Object.keys(emojiCategories)[0]);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Filter emojis based on search
  const getFilteredEmojis = () => {
    if (searchQuery.trim()) {
      // Use search function when there's a query
      return searchEmojis(searchQuery);
    }
    
    // Show selected category when no search
    return emojiCategories[selectedCategory as keyof typeof emojiCategories] || [];
  };

  const filteredEmojis = getFilteredEmojis();

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-16 left-0 bg-white rounded-lg shadow-2xl border border-gray-200 w-80 md:w-96 z-50"
    >
      {/* Header with Search */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search emojis..."
            className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-900 bg-white placeholder-gray-400"
            autoFocus
          />
          <svg
            className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Category Tabs */}
      {!searchQuery && (
        <div className="flex overflow-x-auto px-2 py-2 border-b border-gray-200 scrollbar-hide">
          {Object.keys(emojiCategories).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Emoji Grid */}
      <div className="p-3 h-64 overflow-y-auto">
        {filteredEmojis.length > 0 ? (
          <div className="grid grid-cols-8 gap-1">
            {filteredEmojis.map((emoji, index) => (
              <button
                key={`${emoji}-${index}`}
                onClick={() => {
                  onEmojiSelect(emoji);
                  onClose();
                }}
                className="text-2xl p-2 hover:bg-gray-100 rounded transition-colors"
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No emojis found
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500">
          Click an emoji to insert • ESC to close
        </p>
      </div>
    </div>
  );
}
