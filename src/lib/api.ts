
// API configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://pascual-route-genius-ai.onrender.com';

// Helper function to create API URLs
export const createApiUrl = (endpoint: string) => {
  // If we're in development and using proxy, use relative URLs
  if (import.meta.env.DEV) {
    return endpoint;
  }
  // In production, use the full API URL
  return `${API_BASE_URL}${endpoint}`;
};
