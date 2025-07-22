import api from '@/services/api';
import {MilestoneCategory} from '@/interfaces/milestone.interface';

/**
 * Service for managing milestone events
 */
export class MilestonesService {
  /**
   * Get all available milestones
   */
  static async getAllMilestones() {
    try {
      const response = await api.get('/milestones');
      return response.data;
    } catch (error) {
      console.error('Error fetching all milestones:', error);
      throw error;
    }
  }

  /**
   * Get all milestones grouped by category
   */
  static async getAllMilestonesByCategory() {
    try {
      const response = await api.get('/milestones/by-category');
      return response.data;
    } catch (error) {
      console.error('Error fetching milestones by category:', error);
      throw error;
    }
  }
  /**
   * Create a milestone event for a child
   */
  static async createMilestoneEvent(milestoneData: {
    childId: string;
    category: MilestoneCategory;
    milestone: string;
    expectedAgeMonths: number;
    ageRangeMonths: [number, number];
    achievedDate: string;
    notes?: string;
  }) {
    try {
      const response = await api.post('/events/milestone', milestoneData);
      return response.data;
    } catch (error) {
      console.error('Error creating milestone event:', error);
      throw error;
    }
  }

  /**
   * Get all milestone events for a child
   */
  static async getMilestoneEvents(childId: string) {
    try {
      return await api.get(`/events/milestone/child/${childId}`);
    } catch (error) {
      console.error('Error fetching milestone events:', error);
      throw error;
    }
  }

  /**
   * Get all milestones with their achievement status for a child
   */
  static async getChildMilestones(childId: string) {
    try {
      // With fetch API, the response is already the parsed JSON data
      // No need to access .data property like with axios
      return await api.get(`/events/milestone/status/child/${childId}`);
    } catch (error) {
      console.error('Error fetching child milestones:', error);
      throw error;
    }
  }

  /**
   * Delete a milestone achievement event
   */
  static async deleteMilestoneEvent(eventId: string) {
    try {
      const response = await api.delete(`/events/milestone/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting milestone event:', error);
      throw error;
    }
  }
}

/**
 * Instance-based service for managing milestone events
 * This provides compatibility with the default export pattern used by other services
 */
class MilestoneServiceInstance {
  /**
   * Get all available milestones
   */
  async getAllMilestones() {
    return MilestonesService.getAllMilestones();
  }

  /**
   * Get all milestones grouped by category
   */
  async getAllMilestonesByCategory() {
    return MilestonesService.getAllMilestonesByCategory();
  }

  /**
   * Create a milestone event for a child
   */
  async createMilestoneEvent(milestoneData: {
    childId: string;
    category: MilestoneCategory;
    milestone: string;
    expectedAgeMonths: number;
    ageRangeMonths: [number, number];
    achievedDate: string;
    notes?: string;
  }) {
    return MilestonesService.createMilestoneEvent(milestoneData);
  }

  /**
   * Get all milestone events for a child
   */
  async getMilestoneEvents(childId: string) {
    return MilestonesService.getMilestoneEvents(childId);
  }

  /**
   * Get all milestones with their achievement status for a child
   * This is also aliased as getMilestones for compatibility with RecentActivity.vue
   */
  async getChildMilestones(childId: string) {
    return MilestonesService.getChildMilestones(childId);
  }

  /**
   * Alias for getChildMilestones to maintain compatibility with RecentActivity.vue
   */
  async getMilestones(childId: string) {
    return this.getChildMilestones(childId);
  }

  /**
   * Delete a milestone achievement event
   */
  async deleteMilestoneEvent(eventId: string) {
    return MilestonesService.deleteMilestoneEvent(eventId);
  }
}

export default new MilestoneServiceInstance();