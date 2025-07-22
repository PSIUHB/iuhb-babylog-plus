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
  name?: string; // Virtual field for simplified forms
  birthDate: Date;
  gender: Gender;
  avatarUrl?: string;
  notes?: string;
  status: string;
  isActive?: boolean; // Virtual field derived from status
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChildCreateDto {
  familyId: string;
  firstName?: string;
  lastName?: string;
  name?: string; // Alternative to firstName and lastName for simplified forms
  birthDate: Date;
  gender: Gender;
  notes?: string;
  isActive?: boolean; // Shorthand for status (true = active, false = inactive)
  status?: string; // Status of the child (active, inactive, etc.)
  birthWeightKg?: number; // Birth weight in kilograms
  birthHeightCm?: number; // Birth height in centimeters
}

export interface ChildUpdateDto {
  firstName?: string;
  lastName?: string;
  name?: string; // Alternative to firstName and lastName for simplified forms
  birthDate?: Date;
  gender?: Gender;
  avatarUrl?: string;
  notes?: string;
  isActive?: boolean; // Shorthand for status (true = active, false = inactive)
  status?: string; // Status of the child (active, inactive, etc.)
  birthWeightKg?: number; // Birth weight in kilograms
  birthHeightCm?: number; // Birth height in centimeters
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