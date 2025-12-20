"use client";
import { useState, useEffect } from 'react';

export interface DictData {
  word: string;
  definition: string;
  example?: string;
}

interface Props {
  selection: Selection | null;
  onClose: () => void;
}

async function fetchDefinition(word: string): Promise<DictData | null> {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (!res.ok) return null;
    const json = await res.json();
    const first = json?.[0];
    const meaning = first?.meanings?.[0]?.definitions?.[0];
    return {
      word,
      definition: meaning?.definition || 'No definition',
      example: meaning?.example,
    };
  } catch {
    return null;
  }
}

export default function DictPopup({ selection, onClose }: Props) {
  const [data, setData] = useState<DictData | null>(null);
  useEffect(() => {
    if (!selection) return;
    const raw = selection.toString().trim();
    // Find the first word in the selection (sequence of letters and apostrophes)
    const match = raw.match(/[A-Za-z']+/);
    if (!match) return;
    const word = match[0];
    fetchDefinition(word.toLowerCase()).then(setData);
  }, [selection]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (e.target instanceof Element && !e.target.closest('.dict-popup')) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!selection) return null;
  const rect = selection.getRangeAt(0).getBoundingClientRect();
  const top = rect.bottom + window.scrollY + 8;
  const left = rect.left + window.scrollX;

  return (
    <div className="fixed inset-0 z-50" style={{ pointerEvents: 'none' }}>
      <div
        className="dict-popup absolute bg-white border border-gray-300 rounded shadow-lg p-3 w-64 text-sm"
        style={{ top, left, pointerEvents: 'auto' }}
      >
        {!data ? (
          <p className="italic text-gray-500">Loading…</p>
        ) : (
          <>
            <h3 className="font-bold mb-1 capitalize">{data.word}</h3>
            <p className="mb-2">{data.definition}</p>
            {data.example && (
              <p className="text-gray-600">“{data.example}”</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
