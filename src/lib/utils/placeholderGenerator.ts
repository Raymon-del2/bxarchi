/**
 * Generate a colorful placeholder image for books without covers
 * Uses the book title to generate a consistent color and design
 */

// Color palettes for book covers
const COLOR_PALETTES = [
  { bg: '#667eea', text: '#ffffff' }, // Purple
  { bg: '#f093fb', text: '#ffffff' }, // Pink
  { bg: '#4facfe', text: '#ffffff' }, // Blue
  { bg: '#43e97b', text: '#ffffff' }, // Green
  { bg: '#fa709a', text: '#ffffff' }, // Rose
  { bg: '#feca57', text: '#2d3436' }, // Yellow
  { bg: '#ff6b6b', text: '#ffffff' }, // Red
  { bg: '#ee5a6f', text: '#ffffff' }, // Coral
  { bg: '#a29bfe', text: '#ffffff' }, // Lavender
  { bg: '#fd79a8', text: '#ffffff' }, // Magenta
  { bg: '#00b894', text: '#ffffff' }, // Teal
  { bg: '#6c5ce7', text: '#ffffff' }, // Indigo
];

/**
 * Generate a hash from a string to consistently select colors
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate a placeholder SVG as a data URL
 */
export function generateBookPlaceholder(title: string, author?: string): string {
  const hash = hashString(title);
  const palette = COLOR_PALETTES[hash % COLOR_PALETTES.length];
  
  // Truncate title and author for display
  const displayTitle = title.length > 40 ? title.substring(0, 37) + '...' : title;
  const displayAuthor = author && author.length > 30 ? author.substring(0, 27) + '...' : author || 'Unknown Author';
  
  // Create a more book-like cover without large letters
  const svg = `
    <svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${palette.bg};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${adjustBrightness(palette.bg, -30)};stop-opacity:1" />
        </linearGradient>
        <filter id="shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="400" height="600" fill="url(#grad${hash})"/>
      
      <!-- Book spine effect -->
      <rect x="0" y="0" width="20" height="600" fill="${adjustBrightness(palette.bg, -50)}" opacity="0.5"/>
      
      <!-- Decorative border -->
      <rect x="20" y="20" width="360" height="560" fill="none" stroke="${palette.text}" stroke-width="2" opacity="0.2"/>
      <rect x="30" y="30" width="340" height="540" fill="none" stroke="${palette.text}" stroke-width="1" opacity="0.1"/>
      
      <!-- Book icon at top -->
      <g transform="translate(200, 80)" filter="url(#shadow)">
        <rect x="-25" y="-30" width="50" height="60" fill="${palette.text}" opacity="0.2" rx="3"/>
        <rect x="-20" y="-25" width="40" height="50" fill="${palette.text}" opacity="0.3" rx="2"/>
        <line x1="-15" y1="-15" x2="15" y2="-15" stroke="${palette.bg}" stroke-width="2"/>
        <line x1="-15" y1="-5" x2="15" y2="-5" stroke="${palette.bg}" stroke-width="2"/>
        <line x1="-15" y1="5" x2="5" y2="5" stroke="${palette.bg}" stroke-width="2"/>
      </g>
      
      <!-- Title -->
      <text x="200" y="200" font-family="Georgia, serif" font-size="32" font-weight="bold" 
            fill="${palette.text}" text-anchor="middle" filter="url(#shadow)">
        ${escapeXml(displayTitle)}
      </text>
      
      <!-- Author -->
      <text x="200" y="240" font-family="Georgia, serif" font-size="18" 
            fill="${palette.text}" text-anchor="middle" opacity="0.9">
        ${escapeXml(displayAuthor)}
      </text>
      
      <!-- Decorative line -->
      <line x1="100" y1="260" x2="300" y2="260" stroke="${palette.text}" stroke-width="1" opacity="0.3"/>
      
      <!-- Genre indicator -->
      <rect x="150" y="500" width="100" height="30" fill="${palette.text}" opacity="0.1" rx="15"/>
      <text x="200" y="520" font-family="Arial, sans-serif" font-size="14" font-weight="bold"
            fill="${palette.text}" text-anchor="middle" opacity="0.7">
        CLASSIC
      </text>
      
      <!-- Corner decorations -->
      <path d="M 30 30 L 50 30 L 30 50 Z" fill="${palette.text}" opacity="0.1"/>
      <path d="M 370 30 L 370 50 L 350 30 Z" fill="${palette.text}" opacity="0.1"/>
      <path d="M 30 570 L 30 550 L 50 570 Z" fill="${palette.text}" opacity="0.1"/>
      <path d="M 370 570 L 350 570 L 370 550 Z" fill="${palette.text}" opacity="0.1"/>
    </svg>
  `;
  
  // Convert SVG to data URL
  const base64 = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Adjust color brightness
 */
function adjustBrightness(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}

/**
 * Generate a simple color-based placeholder (for smaller use cases)
 */
export function generateSimplePlaceholder(text: string): string {
  const hash = hashString(text);
  const palette = COLOR_PALETTES[hash % COLOR_PALETTES.length];
  const letter = text.charAt(0).toUpperCase();
  
  const svg = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="${palette.bg}"/>
      <text x="100" y="130" font-family="Arial, sans-serif" font-size="80" font-weight="bold" 
            fill="${palette.text}" text-anchor="middle">
        ${letter}
      </text>
    </svg>
  `;
  
  const base64 = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${base64}`;
}
