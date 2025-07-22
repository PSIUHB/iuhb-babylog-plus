import api from './api';
import { TrackableService } from './trackable.service';
import type {
  Temperature,
  TemperatureCreateDto,
  TemperatureUpdateDto,
  ITemperaturesService
} from '@/interfaces/trackable.interface';

/**
 * Service for managing temperatures
 */
class TemperaturesService extends TrackableService<Temperature, TemperatureCreateDto, TemperatureUpdateDto> implements ITemperaturesService {
  constructor() {
    super('temperatures');
  }

  /**
   * Get statistics for temperatures
   */
  async getStatistics(childId: string): Promise<any> {
    return api.get(`/temperatures/statistics/child/${childId}`);
  }
}

export default new TemperaturesService();