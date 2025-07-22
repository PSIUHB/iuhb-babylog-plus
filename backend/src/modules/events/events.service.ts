import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Event } from './entities/event.entity';
import { EventType } from '@/interfaces/event.interface';
import { CreateEventDto } from './dto/create-event.dto';
import { User } from '@/modules/users/entities/user.entity';
import { ChildrenService } from '@/modules/children/children.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateMilestoneEventDto } from './dto/create-milestone-event.dto';
import { MilestoneCategory } from '@/interfaces/milestone.interface';
import { MilestonesService } from '@/modules/milestones/milestones.service';

@Injectable()
export class EventsService {
    constructor(
        @InjectRepository(Event)
        private eventRepository: Repository<Event>,
        @Inject(forwardRef(() => ChildrenService))
        private childrenService: ChildrenService,
        private eventEmitter: EventEmitter2,
        private milestonesService: MilestonesService,
    ) {}

    async create(createEventDto: CreateEventDto, user: User): Promise<Event[]> {
        const events: Event[] = [];

        // Validate access to all children
        for (const childId of createEventDto.childIds) {
            await this.childrenService.findOne(childId, user);
        }

        // Create event for each child
        for (const childId of createEventDto.childIds) {
            const event = this.eventRepository.create({
                ...createEventDto,
                childId,
                createdByUserId: user.id,
            });

            const savedEvent = await this.eventRepository.save(event);
            events.push(savedEvent);

            // Emit event for real-time updates
            const child = await this.childrenService.findOne(childId, user);

            // Emit event for WebSocket gateway to handle
            this.eventEmitter.emit('event.created', {
                event: savedEvent,
                child,
                user: { id: user.id, firstName: user.firstName, lastName: user.lastName },
            });
        }

        return events;
    }

    async findByChild(childId: string, user: User, query?: any): Promise<Event[]> {
        // Validate access
        await this.childrenService.findOne(childId, user);

        const where: any = { childId };

        if (query?.startDate && query?.endDate) {
            where.occurredAt = Between(
                new Date(query.startDate),
                new Date(query.endDate),
            );
        }

        if (query?.type) {
            where.type = query.type;
        }

        return this.eventRepository.find({
            where,
            order: { occurredAt: 'DESC' },
            relations: ['child', 'createdByUser'],
            take: query?.limit || 50,
        });
    }

    async findByFamily(familyId: string, user: User, query?: any): Promise<Event[]> {
        // Get all children in family
        const children = await this.childrenService.findAllByFamily(familyId, user);
        const childIds = children.map(c => c.id);

        if (childIds.length === 0) {
            return [];
        }

        const where: any = { childId: In(childIds) };

        if (query?.startDate && query?.endDate) {
            where.occurredAt = Between(
                new Date(query.startDate),
                new Date(query.endDate),
            );
        }

        return this.eventRepository.find({
            where,
            order: { occurredAt: 'DESC' },
            relations: ['child', 'createdByUser'],
            take: query?.limit || 100,
        });
    }

    async getStatistics(childId: string, user: User): Promise<any> {
        await this.childrenService.findOne(childId, user);

        const last24h = new Date();
        last24h.setHours(last24h.getHours() - 24);

        const last7d = new Date();
        last7d.setDate(last7d.getDate() - 7);

        // Get various statistics
        const [
            feedingStats,
            sleepStats,
            diaperStats,
        ] = await Promise.all([
            this.getFeedingStats(childId, last24h, last7d),
            this.getSleepStats(childId, last24h, last7d),
            this.getDiaperStats(childId, last24h, last7d),
        ]);

        return {
            feeding: feedingStats,
            sleep: sleepStats,
            diaper: diaperStats,
        };
    }

    private async getFeedingStats(childId: string, last24h: Date, last7d: Date) {
        const feedings24h = await this.eventRepository.find({
            where: {
                childId,
                type: EventType.FEEDING,
                occurredAt: Between(last24h, new Date()),
            },
        });

        const feedings7d = await this.eventRepository.find({
            where: {
                childId,
                type: EventType.FEEDING,
                occurredAt: Between(last7d, new Date()),
            },
        });

        return {
            last24h: {
                count: feedings24h.length,
                averageInterval: this.calculateAverageInterval(feedings24h),
                totalVolume: this.calculateTotalVolume(feedings24h),
            },
            last7d: {
                count: feedings7d.length,
                dailyAverage: feedings7d.length / 7,
                averageVolume: this.calculateAverageVolume(feedings7d),
            },
        };
    }

    private async getSleepStats(childId: string, last24h: Date, last7d: Date) {
        // Implementation for sleep statistics
        return {};
    }

    private async getDiaperStats(childId: string, last24h: Date, last7d: Date) {
        // Implementation for diaper statistics
        return {};
    }

    private calculateAverageInterval(events: Event[]): number {
        if (events.length < 2) return 0;

        const intervals: number[] = [];
        for (let i = 1; i < events.length; i++) {
            const interval = events[i].occurredAt.getTime() - events[i - 1].occurredAt.getTime();
            intervals.push(interval);
        }

        return intervals.reduce((a, b) => a + b, 0) / intervals.length / (1000 * 60 * 60); // in hours
    }

    private calculateTotalVolume(events: Event[]): number {
        return events.reduce((total, event) => {
            return total + (event.data.amount_ml || 0);
        }, 0);
    }

    private calculateAverageVolume(events: Event[]): number {
        const feedingsWithVolume = events.filter(e => e.data.amount_ml);
        if (feedingsWithVolume.length === 0) return 0;

        const total = this.calculateTotalVolume(feedingsWithVolume);
        return total / feedingsWithVolume.length;
    }

    /**
     * Create a milestone event for a child
     */
    async createMilestoneEvent(createMilestoneEventDto: CreateMilestoneEventDto, user: User): Promise<Event> {
        // Validate access to the child
        await this.childrenService.findOne(createMilestoneEventDto.childId, user);

        // Find the milestone in the database
        const milestones = await this.milestonesService.findByCategory(createMilestoneEventDto.category);
        const milestone = milestones.find(m => m.milestone === createMilestoneEventDto.milestone);
        
        if (!milestone) {
            throw new NotFoundException(`Milestone "${createMilestoneEventDto.milestone}" not found in category ${createMilestoneEventDto.category}`);
        }

        // Create the milestone event
        const event = this.eventRepository.create({
            childId: createMilestoneEventDto.childId,
            createdByUserId: user.id,
            type: EventType.MILESTONE,
            occurredAt: new Date(createMilestoneEventDto.achievedDate),
            notes: createMilestoneEventDto.notes,
            data: {
                milestoneId: milestone.id,
                category: milestone.category,
                milestone: milestone.milestone,
                expectedAgeMonths: milestone.expectedAgeMonths,
                ageRangeMonths: milestone.ageRangeMonths,
                achievedDate: createMilestoneEventDto.achievedDate
            }
        });

        const savedEvent = await this.eventRepository.save(event);

        // Emit event for real-time updates
        const child = await this.childrenService.findOne(createMilestoneEventDto.childId, user);

        // Emit event for WebSocket gateway to handle
        this.eventEmitter.emit('event.milestone.created', {
            event: savedEvent,
            child,
            user: { id: user.id, firstName: user.firstName, lastName: user.lastName },
            milestone: milestone
        });

        return savedEvent;
    }

    /**
     * Get all milestone events for a child
     */
    async getMilestoneEvents(childId: string, user: User): Promise<Event[]> {
        // Validate access
        await this.childrenService.findOne(childId, user);

        return this.eventRepository.find({
            where: {
                childId,
                type: EventType.MILESTONE
            },
            order: { occurredAt: 'DESC' },
            relations: ['createdByUser']
        });
    }

    /**
     * Get all available milestones with their achievement status for a child
     */
    async getChildMilestones(childId: string, user: User): Promise<Record<MilestoneCategory, any[]>> {
        try {
            // Validate access
            const child = await this.childrenService.findOne(childId, user);

            // Get all milestone events for this child
            const milestoneEvents = await this.getMilestoneEvents(childId, user);

            // Create a map of achieved milestones
            const achievedMilestones = new Map();
            milestoneEvents.forEach(event => {
                const key = `${event.data.category}:${event.data.milestone}`;
                achievedMilestones.set(key, {
                    achievedDate: event.data.achievedDate,
                    eventId: event.id
                });
            });

            // Get all milestones from the database grouped by category
            const allMilestones = await this.milestonesService.getAllByCategory();

            // Debug logging
            console.log('All milestones from service:', allMilestones);

            // Check if allMilestones is null or undefined
            if (!allMilestones) {
                console.error('getAllByCategory returned null/undefined');
                // Return empty structure instead of undefined
                return {
                    [MilestoneCategory.MOTOR_DEVELOPMENT]: [],
                    [MilestoneCategory.COMMUNICATION_LANGUAGE]: [],
                    [MilestoneCategory.COGNITIVE_DEVELOPMENT]: [],
                    [MilestoneCategory.SOCIAL_EMOTIONAL]: [],
                    [MilestoneCategory.SELF_CARE]: [],
                    [MilestoneCategory.PHYSICAL_GROWTH]: []
                };
            }

            // Create the response with all milestones and their achievement status
            const result: Record<MilestoneCategory, any[]> = {
                [MilestoneCategory.MOTOR_DEVELOPMENT]: [],
                [MilestoneCategory.COMMUNICATION_LANGUAGE]: [],
                [MilestoneCategory.COGNITIVE_DEVELOPMENT]: [],
                [MilestoneCategory.SOCIAL_EMOTIONAL]: [],
                [MilestoneCategory.SELF_CARE]: [],
                [MilestoneCategory.PHYSICAL_GROWTH]: []
            };

            for (const category of Object.values(MilestoneCategory)) {
                result[category] = (allMilestones[category] || []).map(milestone => {
                    const key = `${milestone.category}:${milestone.milestone}`;
                    const achieved = achievedMilestones.get(key);

                    return {
                        id: milestone.id,
                        category: milestone.category,
                        milestone: milestone.milestone,
                        expectedAgeMonths: milestone.expectedAgeMonths,
                        ageRangeMonths: milestone.ageRangeMonths,
                        achieved: !!achieved,
                        achievedDate: achieved ? achieved.achievedDate : null,
                        eventId: achieved ? achieved.eventId : null
                    };
                });
            }

            console.log('Final result:', result);
            return result;
        } catch (error) {
            console.error('Error in getChildMilestones:', error);
            // Return empty structure on error instead of throwing
            return {
                [MilestoneCategory.MOTOR_DEVELOPMENT]: [],
                [MilestoneCategory.COMMUNICATION_LANGUAGE]: [],
                [MilestoneCategory.COGNITIVE_DEVELOPMENT]: [],
                [MilestoneCategory.SOCIAL_EMOTIONAL]: [],
                [MilestoneCategory.SELF_CARE]: [],
                [MilestoneCategory.PHYSICAL_GROWTH]: []
            };
        }
    }

    /**
     * Delete a milestone event
     */
    async deleteMilestoneEvent(eventId: string, user: User): Promise<void> {
        // Find the event first
        const event = await this.eventRepository.findOne({
            where: { id: eventId },
            relations: ['child']
        });

        if (!event) {
            throw new NotFoundException(`Milestone event with ID ${eventId} not found`);
        }

        // Validate that the event is a milestone event
        if (event.type !== EventType.MILESTONE) {
            throw new NotFoundException('This event is not a milestone event');
        }

        // Validate access to the child
        await this.childrenService.findOne(event.childId, user);

        // Delete the event
        await this.eventRepository.remove(event);

        // Emit event for real-time updates
        const child = await this.childrenService.findOne(event.childId, user);

        // Emit event for WebSocket gateway to handle
        this.eventEmitter.emit('event.milestone.deleted', {
            eventId,
            childId: event.childId,
            child,
            user: { id: user.id, firstName: user.firstName, lastName: user.lastName },
            milestone: event.data
        });
    }
}
