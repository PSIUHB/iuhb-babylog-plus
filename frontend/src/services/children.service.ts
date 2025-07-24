import api from './api';
import type { Child, ChildCreateDto, ChildUpdateDto, IChildrenService } from '@/interfaces';
class ChildrenService implements IChildrenService {
  /**
   * Get all children in a family
   */
  async getChildrenByFamily(familyId: string): Promise<Child[]> {
    return api.get(`/children/family/${familyId}`);
  }
  /**
   * Get a specific child by ID
   */
  async getChild(childId: string): Promise<Child> {
    return api.get(`/children/${childId}`);
  }
  /**
   * Create a new child in a family
   */
  async createChild(familyId: string, childData: ChildCreateDto): Promise<Child> {
    return api.post(`/children/family/${familyId}`, childData);
  }
  /**
   * Update a child
   */
  async updateChild(childId: string, childData: ChildUpdateDto): Promise<Child> {
    return api.patch(`/children/${childId}`, childData);
  }
  /**
   * Delete a child
   * Note: This endpoint needs to be implemented in the backend
   */
  async deleteChild(childId: string) {
    return api.delete(`/children/${childId}`);
  }
  /**
   * Upload child avatar
   */
  async uploadAvatar(childId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${import.meta.env.VITE_API_URL || '/api/v1'}/children/${childId}/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    }).then(response => {
      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }
      return response.json();
    });
  }
  /**
   * Get child's current status (sleeping/awake)
   */
  async getChildStatus(childId: string): Promise<{ status: string }> {
    return api.get(`/children/${childId}/status`);
  }
}
export default new ChildrenService();
