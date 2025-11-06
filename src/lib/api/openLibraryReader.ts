/**
 * Open Library Reader API
 * Fetch book content for reading within the app
 */

export interface BookContent {
  title: string;
  author: string;
  content: string;
  chapters?: string[];
  fullText?: string;
  error?: string;
}

/**
 * Fetch book content from Open Library
 * Note: Not all books have full text available
 */
export async function fetchBookContent(workKey: string): Promise<BookContent | null> {
  try {
    // Try to get the work details
    const workResponse = await fetch(`https://openlibrary.org${workKey}.json`);
    
    if (!workResponse.ok) {
      throw new Error('Failed to fetch book details');
    }

    const workData = await workResponse.json();
    
    // Get the first edition
    const editionsResponse = await fetch(`https://openlibrary.org${workKey}/editions.json`);
    const editionsData = await editionsResponse.json();
    
    if (!editionsData.entries || editionsData.entries.length === 0) {
      return null;
    }

    const firstEdition = editionsData.entries[0];
    
    // Try to get full text from Internet Archive
    if (firstEdition.ocaid) {
      const iaText = await fetchInternetArchiveText(firstEdition.ocaid);
      if (iaText) {
        return {
          title: workData.title || 'Unknown Title',
          author: workData.authors?.[0]?.name || 'Unknown Author',
          content: iaText,
          fullText: iaText,
        };
      }
    }

    // Fallback: Return description or excerpt
    const description = typeof workData.description === 'string' 
      ? workData.description 
      : workData.description?.value || '';

    return {
      title: workData.title || 'Unknown Title',
      author: workData.authors?.[0]?.name || 'Unknown Author',
      content: description || 'Full text not available for this book. Please visit Open Library to read it.',
      error: 'Full text not available',
    };

  } catch (error) {
    console.error('Error fetching book content:', error);
    return null;
  }
}

/**
 * Fetch text from Internet Archive
 */
async function fetchInternetArchiveText(ocaid: string): Promise<string | null> {
  try {
    // Try to get plain text from Internet Archive
    const response = await fetch(`https://archive.org/stream/${ocaid}/${ocaid}_djvu.txt`);
    
    if (response.ok) {
      const text = await response.text();
      return text;
    }

    return null;
  } catch (error) {
    console.error('Error fetching from Internet Archive:', error);
    return null;
  }
}

/**
 * Get book preview/excerpt
 */
export async function getBookPreview(workKey: string): Promise<string> {
  try {
    const response = await fetch(`https://openlibrary.org${workKey}.json`);
    const data = await response.json();
    
    const description = typeof data.description === 'string' 
      ? data.description 
      : data.description?.value || '';

    const excerpt = data.excerpts?.[0]?.excerpt || '';
    
    return description || excerpt || 'No preview available.';
  } catch (error) {
    return 'Preview not available.';
  }
}
