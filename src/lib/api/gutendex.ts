// Project Gutenberg API via Gutendex
// Free, no API key needed, 60,000+ public domain books

export interface GutendexBook {
  id: number;
  title: string;
  authors: Array<{
    name: string;
    birth_year: number | null;
    death_year: number | null;
  }>;
  subjects: string[];
  bookshelves: string[];
  languages: string[];
  copyright: boolean;
  media_type: string;
  formats: {
    'text/html'?: string;
    'application/epub+zip'?: string;
    'text/plain'?: string;
    'image/jpeg'?: string;
  };
  download_count: number;
}

export interface GutendexResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GutendexBook[];
}

const GUTENDEX_BASE_URL = 'https://gutendex.com';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();

function getCached(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}

export async function searchGutendexBooks(
  searchQuery: string,
  page: number = 1
): Promise<GutendexResponse | null> {
  const cacheKey = `search:${searchQuery}:${page}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${GUTENDEX_BASE_URL}/books/?search=${encodeURIComponent(searchQuery)}&page=${page}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data: GutendexResponse = await response.json();
    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching from Gutendex:', error);
    return null;
  }
}

export async function getPopularGutendexBooks(
  page: number = 1
): Promise<GutendexResponse | null> {
  const cacheKey = `popular:${page}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    // Sort by download count to get most popular
    const url = `${GUTENDEX_BASE_URL}/books/?page=${page}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased to 15 seconds

    const response = await fetch(url, { 
      signal: controller.signal,
      cache: 'no-store' // Prevent caching issues
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('Gutendex API response not OK:', response.status);
      return null;
    }

    const data: GutendexResponse = await response.json();
    // Sort by download count
    data.results.sort((a, b) => b.download_count - a.download_count);
    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching popular books from Gutendex:', error);
    return null;
  }
}

export async function getGutendexBookById(id: number): Promise<GutendexBook | null> {
  const cacheKey = `book:${id}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${GUTENDEX_BASE_URL}/books/${id}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data: GutendexBook = await response.json();
    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching book from Gutendex:', error);
    return null;
  }
}

export function getBookCoverUrl(book: GutendexBook): string {
  // Gutendex provides cover images in formats
  return book.formats['image/jpeg'] || '/placeholder-book.png';
}

export function getBookReadUrl(book: GutendexBook): string | null {
  // Priority: HTML > Plain text
  return book.formats['text/html'] || book.formats['text/plain'] || null;
}

export function getBookDownloadUrl(book: GutendexBook, format: 'epub' | 'text' | 'html'): string | null {
  const formatMap = {
    epub: 'application/epub+zip',
    text: 'text/plain',
    html: 'text/html'
  };
  return book.formats[formatMap[format] as keyof typeof book.formats] || null;
}

export function extractGenreFromSubjects(subjects: string[]): string {
  // Extract genre from subjects
  const genreKeywords = {
    fiction: ['fiction', 'novel', 'romance', 'adventure', 'mystery', 'thriller'],
    science: ['science', 'physics', 'chemistry', 'biology'],
    history: ['history', 'historical', 'war'],
    philosophy: ['philosophy', 'ethics', 'logic'],
    poetry: ['poetry', 'poems', 'verse'],
    drama: ['drama', 'plays', 'theater']
  };

  for (const subject of subjects) {
    const lowerSubject = subject.toLowerCase();
    for (const [genre, keywords] of Object.entries(genreKeywords)) {
      if (keywords.some(keyword => lowerSubject.includes(keyword))) {
        return genre;
      }
    }
  }

  return 'literature';
}
