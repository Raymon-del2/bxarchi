// Google Books API Integration
const GOOGLE_BOOKS_API_KEY = 'AIzaSyBZqQewx8wq-YWTnj-gxU_6g35_hqCyiHk';
const GOOGLE_BOOKS_BASE_URL = 'https://www.googleapis.com/books/v1';

export interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    subtitle?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    pageCount?: number;
    categories?: string[];
    averageRating?: number;
    ratingsCount?: number;
    imageLinks?: {
      smallThumbnail?: string;
      thumbnail?: string;
      small?: string;
      medium?: string;
      large?: string;
      extraLarge?: string;
    };
    language?: string;
    previewLink?: string;
    infoLink?: string;
  };
  accessInfo?: {
    viewability?: string;
    embeddable?: boolean;
    publicDomain?: boolean;
    textToSpeechPermission?: string;
    epub?: {
      isAvailable: boolean;
      downloadLink?: string;
    };
    pdf?: {
      isAvailable: boolean;
      downloadLink?: string;
    };
    webReaderLink?: string;
    accessViewStatus?: string;
  };
}

export interface GoogleBooksResponse {
  kind: string;
  totalItems: number;
  items: GoogleBook[];
}

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCached(key: string): any | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// Search for books
export async function searchGoogleBooks(
  query: string,
  maxResults: number = 20,
  startIndex: number = 0
): Promise<GoogleBooksResponse | null> {
  const cacheKey = `search:${query}:${maxResults}:${startIndex}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${GOOGLE_BOOKS_BASE_URL}/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&startIndex=${startIndex}&key=${GOOGLE_BOOKS_API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Google Books API error:', response.status);
      return null;
    }

    const data: GoogleBooksResponse = await response.json();
    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error searching Google Books:', error);
    return null;
  }
}

// Get popular/featured books
export async function getPopularGoogleBooks(maxResults: number = 20): Promise<GoogleBooksResponse | null> {
  const cacheKey = `popular:${maxResults}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    // Search for bestsellers and highly rated books
    const url = `${GOOGLE_BOOKS_BASE_URL}/volumes?q=subject:fiction&orderBy=relevance&maxResults=${maxResults}&key=${GOOGLE_BOOKS_API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Google Books API error:', response.status);
      return null;
    }

    const data: GoogleBooksResponse = await response.json();
    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching popular books:', error);
    return null;
  }
}

// Get book by ID
export async function getGoogleBookById(bookId: string): Promise<GoogleBook | null> {
  const cacheKey = `book:${bookId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${GOOGLE_BOOKS_BASE_URL}/volumes/${bookId}?key=${GOOGLE_BOOKS_API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Google Books API error:', response.status);
      return null;
    }

    const data: GoogleBook = await response.json();
    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching book:', error);
    return null;
  }
}

// Get book cover URL
export function getBookCoverUrl(book: GoogleBook, size: 'small' | 'medium' | 'large' = 'medium'): string {
  const imageLinks = book.volumeInfo.imageLinks;
  
  if (!imageLinks) {
    return '/placeholder-book.png';
  }

  switch (size) {
    case 'small':
      return imageLinks.smallThumbnail || imageLinks.thumbnail || '/placeholder-book.png';
    case 'large':
      return imageLinks.large || imageLinks.medium || imageLinks.thumbnail || '/placeholder-book.png';
    default:
      return imageLinks.medium || imageLinks.thumbnail || imageLinks.small || '/placeholder-book.png';
  }
}

// Extract genre from categories
export function extractGenreFromCategories(categories?: string[]): string {
  if (!categories || categories.length === 0) return 'other';
  
  const category = categories[0].toLowerCase();
  
  if (category.includes('fiction')) return 'fiction';
  if (category.includes('mystery') || category.includes('crime')) return 'mystery';
  if (category.includes('romance')) return 'romance';
  if (category.includes('science fiction') || category.includes('sci-fi')) return 'sci-fi';
  if (category.includes('fantasy')) return 'fantasy';
  if (category.includes('thriller')) return 'thriller';
  if (category.includes('biography') || category.includes('memoir')) return 'biography';
  if (category.includes('self-help') || category.includes('self help')) return 'self-help';
  if (category.includes('poetry')) return 'poetry';
  if (category.includes('history')) return 'history';
  if (category.includes('philosophy')) return 'philosophy';
  if (category.includes('drama')) return 'drama';
  
  return 'other';
}

// Check if book has readable content
export function hasReadableContent(book: GoogleBook): boolean {
  return (
    book.accessInfo?.viewability === 'ALL_PAGES' ||
    book.accessInfo?.viewability === 'PARTIAL' ||
    book.accessInfo?.publicDomain === true ||
    book.accessInfo?.webReaderLink !== undefined
  );
}

// Get reading link
export function getReadingLink(book: GoogleBook): string | null {
  if (book.accessInfo?.webReaderLink) {
    return book.accessInfo.webReaderLink;
  }
  if (book.volumeInfo.previewLink) {
    return book.volumeInfo.previewLink;
  }
  return null;
}
