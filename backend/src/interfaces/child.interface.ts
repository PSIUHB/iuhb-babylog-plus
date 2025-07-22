export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}

export interface Child {
  id: string;
  familyId: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  gender: Gender;
  avatarUrl?: string;
  birthWeightKg?: number;
  birthHeightCm?: number;
  medicalInfo?: Record<string, any>;
  notes?: string;
  isActive: boolean;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChildCreateDto {
  familyId: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  birthDate: Date;
  gender: Gender;
  birthWeightKg?: number;
  birthHeightCm?: number;
  medicalInfo?: Record<string, any>;
  notes?: string;
  isActive?: boolean;
  status?: string;
}

export interface ChildUpdateDto {
  firstName?: string;
  lastName?: string;
  birthDate?: Date;
  gender?: Gender;
  avatarUrl?: string;
  birthWeightKg?: number;
  birthHeightCm?: number;
  medicalInfo?: Record<string, any>;
  isActive?: boolean;
}

export enum ChildPermission {
  WRITE = 'write',
  READ = 'view'
}

export interface UserChildRelation {
  id: string;
  userId: string;
  childId: string;
  permission: ChildPermission;
}