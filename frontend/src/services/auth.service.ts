import api from './api';
import type { RegisterRequest, LoginRequest, AuthResponse, UserProfile } from '@/interfaces/auth.interface';
import type { IAuthService } from '@/interfaces';

class AuthService implements IAuthService {
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

  /**
   * Activate a user account with the given token
   */
  async activateAccount(token: string): Promise<any> {
    return api.get(`/auth/activate?token=${token}`);
  }

  /**
   * Get pending invitations for the current user
   */
  async getPendingInvitations(): Promise<any[]> {
    return api.get('/families/invitation');
  }
}

export default new AuthService();
