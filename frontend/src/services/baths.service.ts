import api from './api';
import { TrackableService } from './trackable.service';
import type {
  Bath,
  BathCreateDto,
  BathUpdateDto,
  IBathsService
} from '@/interfaces/trackable.interface';

/**
 * Service for managing baths
 */
class BathsService extends TrackableService<Bath, BathCreateDto, BathUpdateDto> implements IBathsService {
  constructor() {
    super('baths');
  }

  /**
   * Get statistics for baths
   */
  async getStatistics(childId: string): Promise<any> {
    return api.get(`/baths/statistics/child/${childId}`);
  }
}

export default new BathsService();