import api from './api';
import type { Family, FamilyCreateDto, FamilyUpdateDto, FamilyWithMembersDto, IFamiliesService } from '@/interfaces';
import type { InvitationCreateDto } from '@/interfaces';

class FamiliesService implements IFamiliesService {
  /**
   * Get all families for the current user
   */
  async getFamilies(): Promise<Family[]> {
    return api.get('/families');
  }

  /**
   * Get a specific family by ID
   */
  async getFamily(familyId: string): Promise<FamilyWithMembersDto> {
    return api.get(`/families/${familyId}`);
  }

  /**
   * Create a new family
   */
  async createFamily(familyData: FamilyCreateDto): Promise<Family> {
    return api.post('/families', familyData);
  }

  /**
   * Update a family
   */
  async updateFamily(familyId: string, familyData: FamilyUpdateDto): Promise<Family> {
    return api.patch(`/families/${familyId}`, familyData);
  }

  /**
   * Invite a member to a family
   */
  async inviteMember(familyId: string, inviteData: InvitationCreateDto) {
    return api.post(`/families/${familyId}/invite`, inviteData);
  }

  /**
   * Join a family using either an invite code or an invitation token
   */
  async joinFamily(code: string) {
    return api.post(`/families/join/${code}`);
  }

  /**
   * Accept a family invitation
   */
  async acceptInvitation(invitationId: string) {
    // First get the invitation to retrieve its token
    const invitation = await api.get(`/families/invitation/${invitationId}`);
    if (!invitation || !invitation.token) {
      throw new Error('Invalid invitation or missing token');
    }

    // Then join the family using the token
    return this.joinFamily(invitation.token);
  }
}

export default new FamiliesService();
