export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  locale?: string;
  timezone?: string;
  emailVerified: boolean;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface UserCreateDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  locale?: string;
  timezone?: string;
}
export interface UserUpdateDto {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  locale?: string;
  timezone?: string;
}
export interface UserLoginDto {
  email: string;
  password: string;
}
export interface UserRegisterDto extends UserCreateDto {
  inviteToken?: string;
}
export interface UserPasswordResetDto {
  token: string;
  password: string;
}
export interface UserPasswordChangeDto {
  currentPassword: string;
  newPassword: string;
}