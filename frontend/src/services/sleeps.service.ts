import api from './api';
import { TrackableService } from './trackable.service';
import type {
  Sleep,
  SleepCreateDto,
  SleepUpdateDto,
  ISleepsService
} from '@/interfaces/trackable.interface';
/**
 * Service for managing sleeps
 */
class SleepsService extends TrackableService<Sleep, SleepCreateDto, SleepUpdateDto> implements ISleepsService {
  constructor() {
    super('sleeps');
  }
  /**
   * Get statistics for sleeps
   */
  async getStatistics(childId: string): Promise<any> {
    return api.get(`/sleeps/statistics/child/${childId}`);
  }
}
export default new SleepsService();