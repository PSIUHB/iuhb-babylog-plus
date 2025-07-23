import api from './api';
import type {
  Trackable,
  TrackableCreateDto,
  TrackableUpdateDto,
  ITrackableService
} from '@/interfaces/trackable.interface';
import eventBus from './event-bus.service';
import { EVENTS } from '@/constants/events';

/**
 * Base service for all trackable entities
 */
export abstract class TrackableService<
  T extends Trackable,
  CreateDto extends TrackableCreateDto,
  UpdateDto extends TrackableUpdateDto
> implements ITrackableService<T, CreateDto, UpdateDto> {
  
  constructor(protected endpoint: string) {}

  /**
   * Create a new trackable
   */
  async create(data: CreateDto): Promise<T> {
    const result = await api.post(`/${this.endpoint}`, data);
    // Emit event for trackable created
    eventBus.emit(EVENTS.TRACKABLE_CREATED, { type: this.endpoint, data: result });
    return result;
  }

  /**
   * Get all trackables for a child
   */
  async findAll(childId: string): Promise<T[]> {
    return api.get(`/${this.endpoint}/child/${childId}`);
  }

  /**
   * Get a specific trackable by ID
   */
  async findOne(id: string): Promise<T> {
    return api.get(`/${this.endpoint}/${id}`);
  }

  /**
   * Update a trackable
   */
  async update(id: string, data: UpdateDto): Promise<T> {
    const result = await api.patch(`/${this.endpoint}/${id}`, data);
    // Emit event for trackable updated
    eventBus.emit(EVENTS.TRACKABLE_UPDATED, { type: this.endpoint, data: result });
    return result;
  }

  /**
   * Delete a trackable
   */
  async remove(id: string): Promise<void> {
    const result = await api.delete(`/${this.endpoint}/${id}`);
    // Emit event for trackable deleted
    eventBus.emit(EVENTS.TRACKABLE_DELETED, { type: this.endpoint, id });
    return result;
  }
}