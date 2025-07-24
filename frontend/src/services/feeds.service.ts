import api from './api';
import { TrackableService } from './trackable.service';
import type {
  Feed,
  FeedCreateDto,
  FeedUpdateDto,
  IFeedsService
} from '@/interfaces/trackable.interface';
/**
 * Service for managing feeds
 */
class FeedsService extends TrackableService<Feed, FeedCreateDto, FeedUpdateDto> implements IFeedsService {
  constructor() {
    super('feeds');
  }
  /**
   * Get statistics for feeds
   */
  async getStatistics(childId: string): Promise<any> {
    return api.get(`/feeds/statistics/child/${childId}`);
  }
}
export default new FeedsService();