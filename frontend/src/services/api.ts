// API client using fetch instead of axios

// Base API configuration
const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Helper function to handle HTTP errors
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    // If the response is 401 Unauthorized, clear the token but don't redirect
    // Let the calling code handle the error and use Vue Router for navigation
    if (response.status === 401) {
      localStorage.removeItem('token');
      // Don't redirect here - throw an error instead
    }

    // Try to parse error message from response
    let errorMessage;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || 'An error occurred';
    } catch (e) {
      errorMessage = response.status === 500 ? 'Internal server error' : 'An error occurred';
    }

    // For 500 errors, log them silently without throwing
    if (response.status === 500) {
      console.warn(`API Error (${response.status}): ${errorMessage}`);
      return { error: true, message: errorMessage, status: response.status };
    }

    throw new Error(errorMessage);
  }

  // For empty responses (like 204 No Content)
  if (response.status === 204) {
    return null;
  }

  // Parse JSON response
  return response.json();
};

// Create default headers
const getHeaders = () => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add authorization header if token exists
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

import type { IApi } from '@/interfaces';

// API client methods
const api: IApi = {
  /**
   * GET request
   */
  async get(endpoint: string) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`Network error during GET request to ${endpoint}:`, error);
      return { error: true, message: 'Network error occurred', status: 0 };
    }
  },

  /**
   * POST request
   */
  async post(endpoint: string, data?: any) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`Network error during POST request to ${endpoint}:`, error);
      return { error: true, message: 'Network error occurred', status: 0 };
    }
  },

  /**
   * PUT request
   */
  async put(endpoint: string, data?: any) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`Network error during PUT request to ${endpoint}:`, error);
      return { error: true, message: 'Network error occurred', status: 0 };
    }
  },

  /**
   * PATCH request
   */
  async patch(endpoint: string, data?: any) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`Network error during PATCH request to ${endpoint}:`, error);
      return { error: true, message: 'Network error occurred', status: 0 };
    }
  },

  /**
   * DELETE request
   */
  async delete(endpoint: string) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`Network error during DELETE request to ${endpoint}:`, error);
      return { error: true, message: 'Network error occurred', status: 0 };
    }
  }
};

export default api;
