const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
   window.location.hostname === '127.0.0.1');

export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ||
  (typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.VITE_API_BASE_URL) ||
  (typeof window !== 'undefined'
    ? (isLocalhost ? 'http://localhost:5000/api' : `${window.location.origin}/api`)
    : 'http://localhost:5000/api');
