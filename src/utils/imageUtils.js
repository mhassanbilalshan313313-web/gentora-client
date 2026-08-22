// Centralized Image URL Formatter
export const getImageUrl = (url, fallback = '/uploads/settings/default-hero.png') => {
  if (!url) {
    return fallback && fallback !== url ? getImageUrl(fallback, '') : '';
  }

  // Handle object types (e.g. { url: '...' } or { path: '...' } or { src: '...' })
  if (typeof url === 'object' && url !== null) {
    if (typeof url.url === 'string') url = url.url;
    else if (typeof url.path === 'string') url = url.path;
    else if (typeof url.src === 'string') url = url.src;
    else if (Array.isArray(url) && url.length > 0) return getImageUrl(url[0], fallback);
    else return fallback && fallback !== url ? getImageUrl(fallback, '') : '';
  }

  // Ensure url is a string
  if (typeof url !== 'string') {
    return fallback && fallback !== url ? getImageUrl(fallback, '') : '';
  }

  url = url.trim();
  if (!url) {
    return fallback && fallback !== url ? getImageUrl(fallback, '') : '';
  }

  // Blob URLs (local file selection preview)
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }

  // If saved with dev port 5173, replace with backend port 5000 or relative proxy path
  if (url.includes('localhost:5173/uploads/')) {
    return url.replace('localhost:5173/uploads/', 'localhost:5000/uploads/');
  }

  // If full http/https URL (e.g. Cloudinary https://res.cloudinary.com/...), return directly
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Environment-aware backend host URL for legacy/local relative upload paths
  const backendBase = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
    : typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? window.location.origin
    : 'http://localhost:5000';

  // If relative path starting with /uploads
  if (url.startsWith('/uploads')) {
    return `${backendBase}${url}`;
  }

  if (url.startsWith('uploads/')) {
    return `${backendBase}/${url}`;
  }

  return url;
};
