// Open Library API integration
// Free, no API key needed, millions of books

export interface OpenLibraryBook {
  key: string;
  title: string;
  author_name?: string[];
  author_key?: string[];
  first_publish_year?: number;
  cover_i?: number;
  edition_count: number;
  has_fulltext: boolean;
  public_scan_b: boolean;
  subject?: string[];
  ia?: string[];
  ia_collection?: string[];
  lending_identifier?: string;
  lending_edition_s?: string;
  printdisabled?: boolean;
  readable: boolean;
  ebook_access: string;
  ebook_count_i: number;
  cover_url?: string;
  description?: string;
  publish_date?: string[];
  publisher?: string[];
  language?: string[];
  isbn?: string[];
  oclc?: string[];
  pages?: number;
  weight?: string;
  size?: string;
  format?: string[];
  location?: string[];
  subjects?: string[];
  subject_places?: string[];
  subject_times?: string[];
  subject_people?: string[];
  subject_full?: string[];
  ddc?: string[];
  lcc?: string[];
  lccn?: string[];
  olid?: string[];
  isbn_10?: string[];
  isbn_13?: string[];
  dewey_decimal_class?: string[];
  lc_classifications?: string[];
  lendinglibrary?: boolean;
  public_scan?: boolean;
  inlibrary?: boolean;
}

export interface OpenLibrarySearchResponse {
  start: number;
  num_found: number;
  docs: OpenLibraryBook[];
  numFoundExact: boolean;
  q: string;
  offset: number;
}

export interface OpenLibraryWorkResponse {
  description?: {
    type: string;
    value: string;
  };
  links?: string[];
  subject_places?: string[];
  subject_times?: string[];
  subject_people?: string[];
  subjects?: string[];
  title: string;
  type: {
    key: string;
  };
  key: string;
  covers?: number[];
  created: {
    type: string;
    value: string;
  };
  last_modified: {
    type: string;
    value: string;
  };
  latest_revision: number;
  revision: number;
  first_publish_date?: string;
}

// Search Open Library for books
export async function searchOpenLibraryBooks(query: string, page: number = 1, limit: number = 20): Promise<OpenLibrarySearchResponse | null> {
  try {
    const offset = (page - 1) * limit;
    const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}&fields=key,title,author_name,first_publish_year,cover_i,edition_count,has_fulltext,public_scan_b,subject,ia,ia_collection,lending_identifier,lending_edition_s,printdisabled,readable,ebook_access,ebook_count_i,cover_url,description,publish_date,publisher,language,isbn,oclc,pages,weight,size,format,location,subjects,subject_places,subject_times,subject_people,subject_full,ddc,lcc,lccn,olid,oclc,isbn_10,isbn_13,dewey_decimal_class,lc_classifications,lendinglibrary,printdisabled,public_scan,inlibrary`);
    
    if (!response.ok) {
      throw new Error(`Open Library API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching Open Library:', error);
    return null;
  }
}

// Get popular books from Open Library
export async function getPopularOpenLibraryBooks(limit: number = 20, offset: number = 0): Promise<OpenLibrarySearchResponse | null> {
  try {
    const response = await fetch(`https://openlibrary.org/search.json?subject=popular&limit=${limit}&offset=${offset}&fields=key,title,author_name,first_publish_year,cover_i,edition_count,has_fulltext,public_scan_b,subject,ia,ia_collection,lending_identifier,lending_edition_s,printdisabled,readable,ebook_access,ebook_count_i,cover_url,description,publish_date,publisher,language,isbn,oclc,pages,weight,size,format,location,subjects,subject_places,subject_times,subject_people,subject_full,ddc,lcc,lccn,olid,oclc,isbn_10,isbn_13,dewey_decimal_class,lc_classifications,lendinglibrary,printdisabled,public_scan,inlibrary&sort=new&sort_key=random`);
    
    if (!response.ok) {
      throw new Error(`Open Library API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting popular Open Library books:', error);
    return null;
  }
}

// Get book details by key
export async function getOpenLibraryBookByKey(key: string): Promise<OpenLibraryWorkResponse | null> {
  try {
    const response = await fetch(`https://openlibrary.org${key}.json`);
    
    if (!response.ok) {
      throw new Error(`Open Library API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting Open Library book details:', error);
    return null;
  }
}

// Get cover URL for Open Library book
export function getOpenLibraryCoverUrl(book: OpenLibraryBook, size: 'S' | 'M' | 'L' = 'M'): string | null {
  if (book.cover_i) {
    return `https://covers.openlibrary.org/b/id/${book.cover_i}-${size}.jpg`;
  }
  return null;
}

// Convert Open Library book to our ExternalBook format
export function convertOpenLibraryBook(book: OpenLibraryBook): any {
  return {
    id: `openlibrary-${book.key.replace('/works/', '')}`,
    title: book.title || 'Unknown Title',
    author: book.author_name?.join(', ') || 'Unknown Author',
    coverUrl: getOpenLibraryCoverUrl(book),
    description: typeof book.description === 'string' ? book.description : 
                (book.description as any)?.value || 
                book.subjects?.slice(0, 3).join(', ') || 
                'A book from Open Library',
    genre: book.subjects?.[0] || 'General',
    isExternal: true,
    source: 'openlibrary',
    downloadCount: book.edition_count || 0,
    publishYear: book.first_publish_year,
    language: book.language?.[0] || 'en',
    readable: book.readable || false,
    hasFullText: book.has_fulltext || false
  };
}
