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
  
  // Get first letter of title
  const firstLetter = title.charAt(0).toUpperCase();
  
  // Truncate title and author for display
  const displayTitle = title.length > 30 ? title.substring(0, 27) + '...' : title;
  const displayAuthor = author && author.length > 25 ? author.substring(0, 22) + '...' : author;
  
  // Create SVG
  const svg = `
    <svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${palette.bg};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${adjustBrightness(palette.bg, -20)};stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="400" height="600" fill="url(#grad${hash})"/>
      
      <!-- Decorative elements -->
      <circle cx="50" cy="50" r="30" fill="${palette.text}" opacity="0.1"/>
      <circle cx="350" cy="550" r="40" fill="${palette.text}" opacity="0.1"/>
      
      <!-- Large letter -->
      <text x="200" y="250" font-family="Arial, sans-serif" font-size="180" font-weight="bold" 
            fill="${palette.text}" text-anchor="middle" opacity="0.3">
        ${firstLetter}
      </text>
      
      <!-- Title -->
      <text x="200" y="400" font-family="Arial, sans-serif" font-size="28" font-weight="bold" 
            fill="${palette.text}" text-anchor="middle">
        ${escapeXml(displayTitle)}
      </text>
      
      <!-- Author -->
      ${displayAuthor ? `
      <text x="200" y="440" font-family="Arial, sans-serif" font-size="20" 
            fill="${palette.text}" text-anchor="middle" opacity="0.9">
        ${escapeXml(displayAuthor)}
      </text>
      ` : ''}
      
      <!-- Book icon -->
      <path d="M 180 480 L 180 520 L 220 520 L 220 480 Z M 185 485 L 185 515 M 195 485 L 195 515 M 205 485 L 205 515 M 215 485 L 215 515" 
            stroke="${palette.text}" stroke-width="2" fill="none" opacity="0.5"/>
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
