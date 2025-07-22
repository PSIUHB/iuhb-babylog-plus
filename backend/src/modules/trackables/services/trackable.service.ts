import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Trackable } from '../entities/trackable.entity';
import { User } from '@/modules/users/entities/user.entity';
import { ChildrenService } from '@/modules/children/children.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export abstract class TrackableService<T extends Trackable, CreateDto, UpdateDto> {
    constructor(
        protected readonly repository: Repository<T>,
        protected readonly childrenService: ChildrenService,
        protected readonly eventEmitter: EventEmitter2
    ) {}

    async create(createDto: CreateDto, user: User): Promise<T> {
        // Check if user has access to the child
        await this.childrenService.findOne(createDto['childId'], user);

        const trackable = this.repository.create({
            ...createDto,
            createdByUserId: user.id
        } as any);

        const result = await this.repository.save(trackable);
        
        // TypeORM's save method can return an array or a single entity
        // Make sure we return a single entity of type T
        const savedTrackable = Array.isArray(result) ? result[0] : result;
        
        // Emit event for real-time updates
        this.eventEmitter.emit('trackable.created', {
            trackable: savedTrackable,
            userId: user.id
        });

        return savedTrackable;
    }

    async findAll(childId: string, user: User): Promise<T[]> {
        // Check if user has access to the child
        await this.childrenService.findOne(childId, user);

        return this.repository.find({
            where: { childId },
            order: { occurredAt: 'DESC' }
        } as any);
    }

    async findOne(id: string, user: User): Promise<T> {
        const trackable = await this.repository.findOne({
            where: { id }
        } as any);

        if (!trackable) {
            throw new NotFoundException(`Trackable with ID ${id} not found`);
        }

        // Check if user has access to the child
        await this.childrenService.findOne(trackable.childId, user);

        return trackable;
    }

    async update(id: string, updateDto: UpdateDto, user: User): Promise<T> {
        const trackable = await this.findOne(id, user);

        Object.assign(trackable, updateDto);

        const updatedTrackable = await this.repository.save(trackable);
        
        // Emit event for real-time updates
        this.eventEmitter.emit('trackable.updated', {
            trackable: updatedTrackable,
            userId: user.id
        });

        return updatedTrackable;
    }

    async remove(id: string, user: User): Promise<void> {
        const trackable = await this.findOne(id, user);

        await this.repository.softDelete(id);
        
        // Emit event for real-time updates
        this.eventEmitter.emit('trackable.deleted', {
            trackableId: id,
            childId: trackable.childId,
            userId: user.id
        });
    }
}