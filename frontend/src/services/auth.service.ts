import api from './api';

// Define types for request and response data
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  locale?: string;
  timezone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

class AuthService {
  /**
   * Register a new user
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return api.post('/auth/register', userData);
  }

  /**
   * Login a user
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);

    // Store the token in localStorage
    if (response && response.accessToken) {
      localStorage.setItem('token', response.accessToken);
    }

    return response;
  }

  /**
   * Logout the current user
   */
  logout(): void {
    localStorage.removeItem('token');
  }

  /**
   * Get the current user's profile
   */
  async getProfile(): Promise<UserProfile> {
    return api.get('/auth/profile');
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Get the current auth token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}

export default new AuthService();
