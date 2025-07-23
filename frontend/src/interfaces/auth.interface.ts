/**
 * Authentication related interfaces
 */

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
    isActive?: boolean;
    familyId?: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  isActive?: boolean;
  familyId?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string;
  locale?: string;
  timezone?: string;
}