// Utility functions for image processing

/**
 * Compress and convert image to Base64
 * @param file - Image file to compress
 * @param maxWidth - Maximum width (default: 400px)
 * @param maxHeight - Maximum height (default: 400px)
 * @param quality - Image quality 0-1 (default: 0.8)
 * @returns Base64 string of compressed image
 */
export const compressImageToBase64 = (
  file: File,
  maxWidth: number = 400,
  maxHeight: number = 400,
  quality: number = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        // Create canvas and compress
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64
        const base64 = canvas.toDataURL('image/jpeg', quality);
        resolve(base64);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Validate image file
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in MB (default: 5)
 * @returns Error message if invalid, null if valid
 */
export const validateImageFile = (file: File, maxSizeMB: number = 5): string | null => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return 'Please select an image file';
  }
  
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `Image size should be less than ${maxSizeMB}MB`;
  }
  
  return null;
};

/**
 * Get image dimensions from base64
 * @param base64 - Base64 string
 * @returns Promise with width and height
 */
export const getBase64ImageDimensions = (base64: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = base64;
  });
};
