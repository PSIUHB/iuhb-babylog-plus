export interface Invitation {
  id: string;
  email: string;
  role?: string;
  message?: string;
  familyId: string;
  invitedById?: string;
  accepted: boolean;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
}

export interface InvitationCreateDto {
  email: string;
  role?: string;
  message?: string;
  familyId: string;
}

export interface InvitationResponseDto {
  id: string;
  email: string;
  role?: string;
  message?: string;
  family: {
    id: string;
    name: string;
  };
  invitedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  accepted: boolean;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
}