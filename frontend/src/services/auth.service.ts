import api from './api';
import type { RegisterRequest, LoginRequest, AuthResponse, UserProfile, UpdateUserDto } from '@/interfaces/auth.interface';
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
   * Update the current user's profile
   */
  async updateProfile(userData: UpdateUserDto): Promise<UserProfile> {
    return api.patch('/auth/profile', userData);
  }

  /**
   * Upload avatar for the current user
   */
  async uploadAvatar(file: File): Promise<UserProfile> {
    const formData = new FormData();
    formData.append('file', file);

    const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
    const token = localStorage.getItem('token');

    try {
      // Upload the file to the media endpoint
      const uploadResponse = await fetch(`${apiUrl}/media/upload/avatars`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.message || 'Avatar upload failed');
      }

      // Get the uploaded file URL from the response
      const uploadResult = await uploadResponse.json();
      
      // Update the user profile with the new avatar URL
      return this.updateProfile({ avatarUrl: uploadResult.url });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
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
