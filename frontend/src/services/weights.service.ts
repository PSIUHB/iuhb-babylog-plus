import api from './api';
import { TrackableService } from './trackable.service';
import type {
  Weight,
  WeightCreateDto,
  WeightUpdateDto,
  IWeightsService
} from '@/interfaces/trackable.interface';

/**
 * Service for managing weights
 */
class WeightsService extends TrackableService<Weight, WeightCreateDto, WeightUpdateDto> implements IWeightsService {
  constructor() {
    super('weights');
  }

  /**
   * Get statistics for weights
   */
  async getStatistics(childId: string): Promise<any> {
    return api.get(`/weights/statistics/child/${childId}`);
  }
}

export default new WeightsService();