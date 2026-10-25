export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && window.location.hostname.includes('render.com')
    ? `${window.location.origin}/api`
    : 'http://localhost:5000/api');
