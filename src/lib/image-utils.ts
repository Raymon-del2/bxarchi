// Image utilities to handle external images and prevent Next.js optimization issues

export function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

export function getSafeImageUrl(url: string, fallback: string = '/placeholder-book.png'): string {
  if (!url) {
    console.log('❌ Empty URL provided, using fallback');
    return fallback;
  }
  
  // Handle relative URLs (common for BXARCHI uploads)
  if (url.startsWith('/')) {
    console.log(`📁 Relative URL detected: ${url}`);
    return url; // Let Next.js handle internal URLs
  }
  
  // Handle data URLs (SVG placeholders)
  if (url.startsWith('data:')) {
    return url;
  }
  
  // Handle external URLs
  if (!isValidImageUrl(url)) {
    console.log(`❌ Invalid image URL: ${url}, using fallback`);
    return fallback;
  }
  
  console.log(`✅ Valid image URL: ${url}`);
  return url;
}

export function createImageErrorHandler(fallbackUrl: string) {
  return (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    
    // Prevent infinite loops
    if (target.src === fallbackUrl) {
      console.error('Image failed to load and fallback also failed:', fallbackUrl);
      return;
    }
    
    console.warn('Image failed to load, using fallback:', target.src);
    target.src = fallbackUrl;
    target.style.opacity = '1';
  };
}

export function createImageLoadHandler() {
  return (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.style.opacity = '1';
  };
}

export function getImageStyles() {
  return {
    opacity: 0,
    transition: 'opacity 0.3s ease-in-out'
  } as React.CSSProperties;
}
