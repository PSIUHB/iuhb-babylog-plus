import api from './api';
import type { IStatisticsService } from '@/interfaces';

class StatisticsService implements IStatisticsService {
  /**
   * Get family statistics
   */
  async getFamilyStatistics(familyId: string) {
    try {
      const response = await api.get(`/families/${familyId}/statistics`);
      return response;
    } catch (error) {
      console.error('Error fetching family statistics:', error);
      
      // If the error already has the error property, return it as is
      if (error && typeof error === 'object' && 'error' in error) {
        return error;
      }
      
      // Return an error object that the component can handle
      return {
        error: true,
        message: 'Failed to fetch family statistics'
      };
    }
  }

  /**
   * Get child statistics
   */
  async getChildStatistics(childId: string) {
    try {
      const response = await api.get(`/children/${childId}/statistics`);
      return response;
    } catch (error) {
      console.error('Error fetching child statistics:', error);
      
      // If the error already has the error property, return it as is
      if (error && typeof error === 'object' && 'error' in error) {
        return error;
      }
      
      // Return an error object that the component can handle
      return {
        error: true,
        message: 'Failed to fetch child statistics'
      };
    }
  }
}

export default new StatisticsService();