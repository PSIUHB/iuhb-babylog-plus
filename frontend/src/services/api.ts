// API client using fetch instead of axios

// Base API configuration
const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Helper function to handle HTTP errors
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    // If the response is 401 Unauthorized, clear the token and redirect to login
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }

    // Try to parse error message from response
    let errorMessage;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || 'An error occurred';
    } catch (e) {
      errorMessage = 'An error occurred';
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

// API client methods
const api = {
  /**
   * GET request
   */
  async get(endpoint: string) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  /**
   * POST request
   */
  async post(endpoint: string, data?: any) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse(response);
  },

  /**
   * PUT request
   */
  async put(endpoint: string, data?: any) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse(response);
  },

  /**
   * PATCH request
   */
  async patch(endpoint: string, data?: any) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse(response);
  },

  /**
   * DELETE request
   */
  async delete(endpoint: string) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  }
};

export default api;
