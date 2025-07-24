export enum FamilyRole {
  PARENT = 'parent',
  CAREGIVER = 'caregiver',
  VIEWER = 'viewer'
}
export interface Caregiver {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: FamilyRole;
  status: 'active' | 'inactive';
  lastActive?: Date;
  avatar?: string;
}
export interface CaregiverInviteDto {
  email: string;
  role: FamilyRole;
  message?: string;
}
export interface CaregiverUpdateDto {
  role: FamilyRole;
}