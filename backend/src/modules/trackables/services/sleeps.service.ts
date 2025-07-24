import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Sleep, SleepType, FallAsleepMethod, WakeUpBehavior, WakeUpReason } from '../entities/sleep.entity';
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
        @Inject(forwardRef(() => ChildrenService))
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
                qualityBreakdown: this.calculateQualityBreakdown(last24hSleeps),
                sleepTypeBreakdown: this.calculateSleepTypeBreakdown(last24hSleeps),
                fallAsleepMethodBreakdown: this.calculateFallAsleepMethodBreakdown(last24hSleeps),
                wakeUpBehaviorBreakdown: this.calculateWakeUpBehaviorBreakdown(last24hSleeps),
                wakeUpReasonBreakdown: this.calculateWakeUpReasonBreakdown(last24hSleeps)
            },
            last7d: {
                count: this.countCompleteSleepCycles(last7dSleeps),
                qualityBreakdown: this.calculateQualityBreakdown(last7dSleeps),
                sleepTypeBreakdown: this.calculateSleepTypeBreakdown(last7dSleeps),
                fallAsleepMethodBreakdown: this.calculateFallAsleepMethodBreakdown(last7dSleeps),
                wakeUpBehaviorBreakdown: this.calculateWakeUpBehaviorBreakdown(last7dSleeps),
                wakeUpReasonBreakdown: this.calculateWakeUpReasonBreakdown(last7dSleeps)
            }
        };
    }

    private countCompleteSleepCycles(sleeps: Sleep[]): number {
        // Count complete sleep cycles (entries with both startTime and endTime)
        let count = 0;

        for (const sleep of sleeps) {
            // If this is a single entry with both startTime and endTime
            if (sleep.startTime && sleep.endTime) {
                count++;
            }
        }

        return count;
    }

    private calculateTotalDuration(sleeps: Sleep[]): number {
        // Calculate total duration from sleep entries
        let totalDuration = 0;

        // Process all sleep entries
        sleeps.forEach(sleep => {
            // If this is a single entry with both startTime and endTime
            if (sleep.startTime && sleep.endTime) {
                const durationMs = new Date(sleep.endTime).getTime() - new Date(sleep.startTime).getTime();
                const durationMinutes = Math.round(durationMs / (1000 * 60));
                totalDuration += durationMinutes > 0 ? durationMinutes : 0;
            }
        });
        
        return totalDuration;
    }

    private calculateAverageDuration(sleeps: Sleep[]): number {
        // Calculate average duration from sleep entries
        let totalDuration = 0;
        let count = 0;

        // Process all sleep entries
        sleeps.forEach(sleep => {
            // If this is a single entry with both startTime and endTime
            if (sleep.startTime && sleep.endTime) {
                const durationMs = new Date(sleep.endTime).getTime() - new Date(sleep.startTime).getTime();
                const durationMinutes = Math.round(durationMs / (1000 * 60));
                if (durationMinutes > 0) {
                    totalDuration += durationMinutes;
                    count++;
                }
            }
        });
        
        return count > 0 ? Math.round(totalDuration / count) : 0;
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

    private calculateSleepTypeBreakdown(sleeps: Sleep[]): Record<string, number> {
        const breakdown = {
            nap: 0,
            night: 0,
            other: 0
        };
        
        sleeps.forEach(sleep => {
            if (sleep.sleepType) {
                breakdown[sleep.sleepType]++;
            }
        });
        
        return breakdown;
    }

    private calculateFallAsleepMethodBreakdown(sleeps: Sleep[]): Record<string, number> {
        const breakdown = {
            rocking: 0,
            nursing: 0,
            bottle: 0,
            pacifier: 0,
            self_soothing: 0,
            other: 0
        };
        
        sleeps.forEach(sleep => {
            if (sleep.fallAsleepMethod) {
                breakdown[sleep.fallAsleepMethod]++;
            }
        });
        
        return breakdown;
    }

    private calculateWakeUpBehaviorBreakdown(sleeps: Sleep[]): Record<string, number> {
        const breakdown = {
            calm: 0,
            crying: 0,
            fussy: 0,
            happy: 0
        };
        
        sleeps.forEach(sleep => {
            if (sleep.wakeUpBehavior) {
                breakdown[sleep.wakeUpBehavior]++;
            }
        });
        
        return breakdown;
    }

    private calculateWakeUpReasonBreakdown(sleeps: Sleep[]): Record<string, number> {
        const breakdown = {
            natural: 0,
            noise: 0,
            hunger: 0,
            diaper: 0,
            discomfort: 0,
            other: 0
        };
        
        sleeps.forEach(sleep => {
            if (sleep.wakeUpReason) {
                breakdown[sleep.wakeUpReason]++;
            }
        });
        
        return breakdown;
    }
}