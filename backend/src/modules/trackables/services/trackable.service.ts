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
        // Check if user has access to the child and get the child with family info
        const child = await this.childrenService.findOne(createDto['childId'], user);

        // Debug logging
        console.log('TrackableService.create - Child loaded:', {
            childId: child.id,
            familyId: child.familyId,
            family: child.family,
            familyIdFromRelation: child.family?.id
        });

        const trackable = this.repository.create({
            ...createDto,
            createdByUserId: user.id
        } as any);

        const result = await this.repository.save(trackable);
        
        // TypeORM's save method can return an array or a single entity
        // Make sure we return a single entity of type T
        const savedTrackable = Array.isArray(result) ? result[0] : result;
        
        // Use familyId directly from child entity if family relation is not loaded
        const familyId = child.family?.id || child.familyId;

        console.log('TrackableService.create - Emitting event with familyId:', familyId);

        // Emit event for real-time updates with family ID
        this.eventEmitter.emit('trackable.created', {
            trackable: savedTrackable,
            userId: user.id,
            familyId: familyId
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
        
        // Get the child with family info
        const child = await this.childrenService.findOne(trackable.childId, user);

        Object.assign(trackable, updateDto);

        const updatedTrackable = await this.repository.save(trackable);
        
        // Use familyId directly from child entity if family relation is not loaded
        const familyId = child.family?.id || child.familyId;
        
        console.log('TrackableService.update - Emitting event with familyId:', familyId);
        
        // Emit event for real-time updates with family ID
        this.eventEmitter.emit('trackable.updated', {
            trackable: updatedTrackable,
            userId: user.id,
            familyId: familyId
        });

        return updatedTrackable;
    }

    async remove(id: string, user: User): Promise<void> {
        const trackable = await this.findOne(id, user);
        
        // Get the child with family info
        const child = await this.childrenService.findOne(trackable.childId, user);

        await this.repository.softDelete(id);
        
        // Use familyId directly from child entity if family relation is not loaded
        const familyId = child.family?.id || child.familyId;
        
        console.log('TrackableService.remove - Emitting event with familyId:', familyId);
        
        // Emit event for real-time updates with family ID
        this.eventEmitter.emit('trackable.deleted', {
            trackableId: id,
            childId: trackable.childId,
            userId: user.id,
            familyId: familyId
        });
    }
}