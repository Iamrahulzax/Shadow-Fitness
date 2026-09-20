/**
 * Utility functions for Hunter Profile photo processing and detection
 */

/**
 * Checks if the avatar string represents a photo (base64 Data URL, HTTP/HTTPS URL, or blob)
 * rather than a preset sigil ID (e.g. 'shadow-monarch').
 */
export function isPhotoAvatar(avatar?: string | null): boolean {
  if (!avatar) return false;
  return (
    avatar.startsWith('data:image/') ||
    avatar.startsWith('http://') ||
    avatar.startsWith('https://') ||
    avatar.startsWith('blob:')
  );
}

/**
 * Reads and optimizes an image file into a square, center-cropped base64 JPEG data URL.
 * Automatically resizes image to max dimension (default 360px) and quality 0.85.
 * This guarantees sharp retina rendering while keeping base64 size compact (~25-45KB),
 * preventing browser localStorage quota exhaustion.
 */
export function processImageFile(
  file: File,
  maxSize: number = 360,
  quality: number = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image.'));
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Failed to read image file.'));
    };

    reader.onload = () => {
      const img = new Image();

      img.onerror = () => {
        reject(new Error('Failed to load image data.'));
      };

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            // Fallback to raw data url if canvas context unavailable
            resolve(reader.result as string);
            return;
          }

          // Center-crop to 1:1 square
          const minDim = Math.min(img.width, img.height);
          const cropX = (img.width - minDim) / 2;
          const cropY = (img.height - minDim) / 2;

          const targetDim = Math.min(maxSize, minDim);
          canvas.width = targetDim;
          canvas.height = targetDim;

          // High-quality image rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Draw square cropped image onto canvas
          ctx.drawImage(
            img,
            cropX,
            cropY,
            minDim,
            minDim,
            0,
            0,
            targetDim,
            targetDim
          );

          // Export as optimized JPEG
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(optimizedDataUrl);
        } catch (err) {
          // If canvas fails (e.g. memory or cross-origin), fallback to raw reader result
          resolve(reader.result as string);
        }
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
