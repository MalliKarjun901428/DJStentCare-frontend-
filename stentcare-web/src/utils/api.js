export const API_BASE_URL = 'http://127.0.0.1:8000/api';

/**
 * A native fetch wrapper that automatically handles JSON headers 
 * and attaches the Auth Token from localStorage if available.
 */
export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('stentcare_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const error = (data && data.message) || response.statusText;
    throw new Error(error);
  }

  return data;
};
