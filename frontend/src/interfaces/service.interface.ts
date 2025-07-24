import type { Child, ChildCreateDto, ChildUpdateDto } from './child.interface';
import type { Caregiver, CaregiverInviteDto, CaregiverUpdateDto } from './caregiver.interface';
import type { Family, FamilyCreateDto, FamilyUpdateDto, FamilyWithMembersDto } from './family.interface';
import type { InvitationCreateDto } from './invitation.interface';
import type { RegisterRequest, LoginRequest, AuthResponse, UserProfile, UpdateUserDto } from './auth.interface';
/**
 * Interface for the API service
 */
export interface IApi {
  get(endpoint: string): Promise<any>;
  post(endpoint: string, data?: any): Promise<any>;
  put(endpoint: string, data?: any): Promise<any>;
  patch(endpoint: string, data?: any): Promise<any>;
  delete(endpoint: string): Promise<any>;
}
/**
 * Interface for the Auth service
 */
export interface IAuthService {
  register(userData: RegisterRequest): Promise<AuthResponse>;
  login(credentials: LoginRequest): Promise<AuthResponse>;
  logout(): void;
  getProfile(): Promise<UserProfile>;
  updateProfile(userData: UpdateUserDto): Promise<UserProfile>;
  uploadAvatar(file: File): Promise<UserProfile>;
  isLoggedIn(): boolean;
  getToken(): string | null;
  activateAccount(token: string): Promise<any>;
  getPendingInvitations(): Promise<any[]>;
}
/**
 * Interface for the Children service
 */
export interface IChildrenService {
  getChildrenByFamily(familyId: string): Promise<Child[]>;
  getChild(childId: string): Promise<Child>;
  createChild(familyId: string, childData: ChildCreateDto): Promise<Child>;
  updateChild(childId: string, childData: ChildUpdateDto): Promise<Child>;
  deleteChild(childId: string): Promise<void>;
  uploadAvatar(childId: string, file: File): Promise<Child>;
}
/**
 * Interface for the Caregivers service
 */
export interface ICaregiversService {
  getCaregiversByFamily(familyId: string): Promise<Caregiver[]>;
  inviteCaregiver(familyId: string, caregiverData: CaregiverInviteDto): Promise<any>;
  updateCaregiver(familyId: string, userId: string, caregiverData: CaregiverUpdateDto): Promise<any>;
  removeCaregiver(familyId: string, userId: string): Promise<any>;
  resendInvitation(familyId: string, email: string): Promise<any>;
}
/**
 * Interface for the Families service
 */
export interface IFamiliesService {
  getFamilies(): Promise<Family[]>;
  getFamily(familyId: string): Promise<FamilyWithMembersDto>;
  createFamily(familyData: FamilyCreateDto): Promise<Family>;
  updateFamily(familyId: string, familyData: FamilyUpdateDto): Promise<Family>;
  inviteMember(familyId: string, inviteData: InvitationCreateDto): Promise<any>;
  joinFamily(code: string): Promise<any>;
  acceptInvitation(invitationId: string): Promise<any>;
}
/**
 * Interface for the Statistics service
 */
export interface IStatisticsService {
  getFamilyStatistics(familyId: string): Promise<any>;
  getChildStatistics(childId: string): Promise<any>;
}
