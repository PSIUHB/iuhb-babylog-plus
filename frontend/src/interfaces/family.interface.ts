export interface Family {
  id: string;
  name: string;
  inviteCode: string;
  settings?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface FamilyCreateDto {
  name: string;
}
export interface FamilyUpdateDto {
  name?: string;
  settings?: Record<string, any>;
}
export interface FamilyWithMembersDto extends Family {
  userFamilies?: Array<{
    userId: string;
    role: string;
    isPrimary: boolean;
    joinedAt: Date;
    leftAt?: Date;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      avatarUrl?: string;
      lastLoginAt?: Date;
    };
  }>;
}