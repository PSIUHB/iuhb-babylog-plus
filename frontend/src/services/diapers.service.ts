import api from './api';
import { TrackableService } from './trackable.service';
import type {
  Diaper,
  DiaperCreateDto,
  DiaperUpdateDto,
  IDiapersService
} from '@/interfaces/trackable.interface';
/**
 * Service for managing diapers
 */
class DiapersService extends TrackableService<Diaper, DiaperCreateDto, DiaperUpdateDto> implements IDiapersService {
  constructor() {
    super('diapers');
  }
  /**
   * Get statistics for diapers
   */
  async getStatistics(childId: string): Promise<any> {
    return api.get(`/diapers/statistics/child/${childId}`);
  }
}
export default new DiapersService();