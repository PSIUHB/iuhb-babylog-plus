import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Sleep, SleepStatus } from '../entities/sleep.entity';
import { TrackableService } from './trackable.service';
import { CreateSleepDto } from '../dto/create-sleep.dto';
import { UpdateSleepDto } from '../dto/update-sleep.dto';
import { ChildrenService } from '@/modules/children/children.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '@/modules/users/entities/user.entity';

@Injectable()
export class SleepsService extends TrackableService<Sleep, CreateSleepDto, UpdateSleepDto> {
    constructor(
        @InjectRepository(Sleep)
        private sleepsRepository: Repository<Sleep>,
        childrenService: ChildrenService,
        eventEmitter: EventEmitter2
    ) {
        super(sleepsRepository, childrenService, eventEmitter);
    }

    // Additional methods specific to sleeps

    async getStatistics(childId: string, user: User) {
        // Check if user has access to the child
        await this.childrenService.findOne(childId, user);

        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [last24hSleeps, last7dSleeps] = await Promise.all([
            this.sleepsRepository.find({
                where: {
                    childId,
                    occurredAt: Between(last24h, now)
                },
                order: { occurredAt: 'ASC' }
            }),
            this.sleepsRepository.find({
                where: {
                    childId,
                    occurredAt: Between(last7d, now)
                },
                order: { occurredAt: 'ASC' }
            })
        ]);

        return {
            last24h: {
                count: this.countCompleteSleepCycles(last24hSleeps),
                totalDuration: this.calculateTotalDuration(last24hSleeps),
                averageDuration: this.calculateAverageDuration(last24hSleeps),
                qualityBreakdown: this.calculateQualityBreakdown(last24hSleeps)
            },
            last7d: {
                count: this.countCompleteSleepCycles(last7dSleeps),
                totalDuration: this.calculateTotalDuration(last7dSleeps),
                averageDuration: this.calculateAverageDuration(last7dSleeps),
                qualityBreakdown: this.calculateQualityBreakdown(last7dSleeps)
            }
        };
    }

    private countCompleteSleepCycles(sleeps: Sleep[]): number {
        // Count pairs of start and end events
        let count = 0;
        let hasStart = false;

        for (const sleep of sleeps) {
            if (sleep.status === SleepStatus.START) {
                hasStart = true;
            } else if (sleep.status === SleepStatus.END && hasStart) {
                count++;
                hasStart = false;
            }
        }

        return count;
    }

    private calculateTotalDuration(sleeps: Sleep[]): number {
        // Sum up duration_minutes for all sleep records with duration
        return sleeps.reduce((total, sleep) => {
            return total + (sleep.duration_minutes || 0);
        }, 0);
    }

    private calculateAverageDuration(sleeps: Sleep[]): number {
        const sleepsWithDuration = sleeps.filter(s => s.duration_minutes);
        if (sleepsWithDuration.length === 0) return 0;
        
        const total = sleepsWithDuration.reduce((sum, sleep) => sum + sleep.duration_minutes, 0);
        return Math.round(total / sleepsWithDuration.length);
    }

    private calculateQualityBreakdown(sleeps: Sleep[]): Record<string, number> {
        const breakdown = {
            poor: 0,
            fair: 0,
            good: 0
        };
        
        sleeps.forEach(sleep => {
            if (sleep.quality) {
                breakdown[sleep.quality]++;
            }
        });
        
        return breakdown;
    }
}