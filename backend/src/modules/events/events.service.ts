import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Event, EventType } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { User } from '@/modules/users/entities/user.entity';
import { ChildrenService } from '@/modules/children/children.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WebSocketGateway } from '@/modules/websocket/websocket.gateway';

@Injectable()
export class EventsService {
    constructor(
        @InjectRepository(Event)
        private eventRepository: Repository<Event>,
        private childrenService: ChildrenService,
        private eventEmitter: EventEmitter2,
        private wsGateway: WebSocketGateway,
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
            this.wsGateway.sendEventToFamily(child.familyId, 'event.created', {
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
}