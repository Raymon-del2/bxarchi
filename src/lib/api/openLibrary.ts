// Open Library API integration (free, no API key needed)
// Documentation: https://openlibrary.org/developers/api

export interface ExternalBook {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  description: string;
  publishYear?: number;
  genre?: string;
  pageCount?: number;
  isbn?: string;
  externalUrl: string;
  isExternal: true;
}

interface OpenLibraryWork {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  subject?: string[];
  isbn?: string[];
  number_of_pages_median?: number;
}

interface OpenLibraryResponse {
  docs: OpenLibraryWork[];
  numFound: number;
}

/**
 * Fetch popular/trending books from Open Library
 */
export async function fetchPopularBooks(limit: number = 20): Promise<ExternalBook[]> {
  try {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    // Search for popular books (sorted by rating)
    const response = await fetch(
      `https://openlibrary.org/search.json?q=subject:fiction&sort=rating&limit=${limit}`,
      { 
        signal: controller.signal,
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error('Failed to fetch books from Open Library');
    }

    const data: OpenLibraryResponse = await response.json();
    return data.docs.map(mapToExternalBook);
  } catch (error: any) {
    // Silently handle abort errors
    if (error.name === 'AbortError') {
      console.log('Request timed out, returning empty array');
      return [];
    }
    console.error('Error fetching popular books:', error);
    return [];
  }
}

/**
 * Search books by query
 */
export async function searchExternalBooks(query: string, limit: number = 20): Promise<ExternalBook[]> {
  try {
    const response = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to search books');
    }

    const data: OpenLibraryResponse = await response.json();
    return data.docs.map(mapToExternalBook);
  } catch (error) {
    console.error('Error searching books:', error);
    return [];
  }
}

/**
 * Fetch books by genre/subject
 */
export async function fetchBooksByGenre(genre: string, limit: number = 20): Promise<ExternalBook[]> {
  try {
    const response = await fetch(
      `https://openlibrary.org/search.json?subject=${encodeURIComponent(genre)}&sort=rating&limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch books by genre');
    }

    const data: OpenLibraryResponse = await response.json();
    return data.docs.map(mapToExternalBook);
  } catch (error) {
    console.error('Error fetching books by genre:', error);
    return [];
  }
}

/**
 * Map Open Library work to ExternalBook format
 */
function mapToExternalBook(work: OpenLibraryWork): ExternalBook {
  const coverId = work.cover_i;
  // Only set coverUrl if cover exists, otherwise empty string for placeholder generation
  // Use Medium size (-M) instead of Large (-L) for faster loading
  const coverUrl = coverId
    ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
    : '';

  const genre = work.subject?.[0] || 'Fiction';
  const author = work.author_name?.[0] || 'Unknown Author';

  return {
    id: work.key,
    title: work.title,
    author: author,
    coverUrl: coverUrl,
    description: `A ${genre.toLowerCase()} book by ${author}`,
    publishYear: work.first_publish_year,
    genre: genre,
    pageCount: work.number_of_pages_median,
    isbn: work.isbn?.[0],
    externalUrl: `https://openlibrary.org${work.key}`,
    isExternal: true,
  };
}

/**
 * Get popular genres
 */
export const POPULAR_GENRES = [
  'Fiction',
  'Fantasy',
  'Science Fiction',
  'Mystery',
  'Romance',
  'Thriller',
  'Horror',
  'Historical Fiction',
  'Adventure',
  'Young Adult',
];
