import api from './api';
import type { Caregiver, ICaregiversService, CaregiverInviteDto, CaregiverUpdateDto } from '@/interfaces';
class CaregiversService implements ICaregiversService {
  /**
   * Get all caregivers in a family
   */
  async getCaregiversByFamily(familyId: string): Promise<Caregiver[]> {
    return api.get(`/families/${familyId}`).then(response => {
      // Extract caregivers from family response
      if (response && response.userFamilies) {
        return response.userFamilies.map((uf: any) => ({
          id: uf.userId,
          firstName: uf.user.firstName,
          lastName: uf.user.lastName,
          email: uf.user.email,
          phone: uf.user.phone,
          role: uf.role,
          status: uf.leftAt ? 'inactive' : 'active',
          lastActive: uf.user.lastLoginAt,
          avatar: uf.user.avatarUrl
        }));
      }
      return [];
    });
  }
  /**
   * Invite a caregiver to a family
   */
  async inviteCaregiver(familyId: string, caregiverData: CaregiverInviteDto) {
    return api.post(`/families/${familyId}/invite`, caregiverData);
  }
  /**
   * Update a caregiver's role in a family
   * Note: This endpoint needs to be implemented in the backend
   */
  async updateCaregiver(familyId: string, userId: string, caregiverData: CaregiverUpdateDto) {
    return api.patch(`/families/${familyId}/members/${userId}`, caregiverData);
  }
  /**
   * Remove a caregiver from a family
   * Note: This uses the leaveFamily endpoint, but needs to be updated to allow admins to remove members
   */
  async removeCaregiver(familyId: string, userId: string) {
    return api.delete(`/families/${familyId}/members/${userId}`);
  }
  /**
   * Resend invitation to a caregiver
   * Note: This endpoint needs to be implemented in the backend
   */
  async resendInvitation(familyId: string, email: string) {
    return api.post(`/families/${familyId}/invite/resend`, { email });
  }
}
export default new CaregiversService();
