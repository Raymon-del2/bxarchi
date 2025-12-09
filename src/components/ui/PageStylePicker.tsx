"use client";
import { useState } from 'react';

export type PageStyle = {
  id: string;          // e.g. 'vintage-paper'
  name: string;        // display name
  className: string;   // CSS class to apply
  thumbnail: string;   // path to preview thumbnail 200x200
};

export const PAGE_STYLES: PageStyle[] = [
  { id: 'vintage-paper', name: 'Vintage Paper', className: 'bx-vintage-paper', thumbnail: '/theme-thumbs/vintage.png' },
  { id: 'torn-paper',    name: 'Torn Paper',    className: 'bx-torn-paper',    thumbnail: '/theme-thumbs/torn.png' },
  { id: 'neon-dark',     name: 'Neon Cyber',    className: 'bx-neon-dark',     thumbnail: '/theme-thumbs/neon.png' },
  { id: 'stone-grey',    name: 'Stone Tablet',  className: 'bx-stone-grey',    thumbnail: '/theme-thumbs/stone.png' },
  { id: 'scroll-gold',   name: 'Fantasy Scroll',className: 'bx-scroll-gold',   thumbnail: '/theme-thumbs/scroll.png' },
  { id: 'horror-dark',   name: 'Horror Grunge', className: 'bx-horror-dark',   thumbnail: '/theme-thumbs/horror.png' },
  { id: 'pure-white',    name: 'Clean White',   className: 'bx-pure-white',    thumbnail: '/theme-thumbs/white.png' },
  { id: 'comic-cream',   name: 'Comic Cream',   className: 'bx-comic-cream',   thumbnail: '/theme-thumbs/comic.png' },
  { id: 'space-gradient',name: 'Galaxy Space',  className: 'bx-space-gradient',thumbnail: '/theme-thumbs/space.png' },
  { id: 'water-pastel',  name: 'Water Pastel',  className: 'bx-water-pastel',  thumbnail: '/theme-thumbs/water.png' },
];

interface Props {
  value: string | null;
  onChange: (id: string) => void;
}

export default function PageStylePicker({ value, onChange }: Props) {
  const [preview, setPreview] = useState<PageStyle | null>(null);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
        {PAGE_STYLES.map(style => (
          <button key={style.id}
            type="button"
            onClick={() => { onChange(style.id); setPreview(style); }}
            className={`relative flex flex-col items-center space-y-1 focus:outline-none ${value===style.id?'ring-2 ring-purple-600':'ring-1 ring-gray-500/30'} rounded-full p-1 transition`}
          >
            {/* live preview circle */}
            <div className={`w-16 h-16 rounded-full overflow-hidden ${style.className}`}/>
            <span className="text-xs mt-1 text-center text-white/90">{style.name}</span>
          </button>
        ))}
      </div>

      {/* preview modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={()=>setPreview(null)}>
          <div className="bg-white max-w-lg w-full rounded shadow-lg p-6 relative" onClick={e=>e.stopPropagation()}>
            <button onClick={()=>setPreview(null)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">✕</button>
            <h2 className="text-lg font-semibold mb-4">This is how your page will appear, Love God…</h2>
            <div className={`relative h-64 overflow-hidden rounded ${PAGE_STYLES.find(s=>s.id===preview.id)?.className}`}>
              <p className="absolute inset-0 flex items-center justify-center text-2xl font-bold">Sample Text</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
