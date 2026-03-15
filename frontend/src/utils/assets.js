/**
 * Formats an asset URL, handling both local paths and cloud URLs (Cloudinary/S3).
 * 
 * @param {string} url - The URL or local path of the asset
 * @returns {string|null} - The full URL to the asset
 */
export const getAssetUrl = (url) => {
    if (!url) return null;
    
    // If it's already a full URL (Cloudinary), return as is
    if (url.startsWith('http')) return url;
    
    // Otherwise, prepend the storage URL (for legacy local uploads)
    const storageUrl = import.meta.env.VITE_STORAGE_URL || 'http://localhost:5000';
    
    // Ensure we don't have double slashes if url starts with /
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    
    return `${storageUrl}${cleanUrl}`;
};
