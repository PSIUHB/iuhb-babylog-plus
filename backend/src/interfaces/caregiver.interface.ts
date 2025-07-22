export enum FamilyRole {
  PARENT = 'parent',
  CAREGIVER = 'caregiver'
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
  permissions: string[];
}

export interface CaregiverInviteDto {
  email: string;
  role: FamilyRole;
  message?: string;
}

export interface CaregiverUpdateDto {
  role: FamilyRole;
}