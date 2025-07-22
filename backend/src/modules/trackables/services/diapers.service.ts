import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Diaper, DiaperType } from '../entities/diaper.entity';
import { TrackableService } from './trackable.service';
import { CreateDiaperDto } from '../dto/create-diaper.dto';
import { UpdateDiaperDto } from '../dto/update-diaper.dto';
import { ChildrenService } from '@/modules/children/children.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '@/modules/users/entities/user.entity';

@Injectable()
export class DiapersService extends TrackableService<Diaper, CreateDiaperDto, UpdateDiaperDto> {
    constructor(
        @InjectRepository(Diaper)
        private diapersRepository: Repository<Diaper>,
        childrenService: ChildrenService,
        eventEmitter: EventEmitter2
    ) {
        super(diapersRepository, childrenService, eventEmitter);
    }

    // Additional methods specific to diapers

    async getStatistics(childId: string, user: User) {
        // Check if user has access to the child
        await this.childrenService.findOne(childId, user);

        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [last24hDiapers, last7dDiapers] = await Promise.all([
            this.diapersRepository.find({
                where: {
                    childId,
                    occurredAt: Between(last24h, now)
                },
                order: { occurredAt: 'ASC' }
            }),
            this.diapersRepository.find({
                where: {
                    childId,
                    occurredAt: Between(last7d, now)
                },
                order: { occurredAt: 'ASC' }
            })
        ]);

        return {
            last24h: {
                count: last24hDiapers.length,
                averageInterval: this.calculateAverageInterval(last24hDiapers),
                typeBreakdown: this.calculateTypeBreakdown(last24hDiapers)
            },
            last7d: {
                count: last7dDiapers.length,
                averageInterval: this.calculateAverageInterval(last7dDiapers),
                typeBreakdown: this.calculateTypeBreakdown(last7dDiapers)
            }
        };
    }

    private calculateAverageInterval(diapers: Diaper[]): number {
        if (diapers.length < 2) return 0;
        
        let totalMinutes = 0;
        for (let i = 1; i < diapers.length; i++) {
            const diff = diapers[i].occurredAt.getTime() - diapers[i-1].occurredAt.getTime();
            totalMinutes += diff / (1000 * 60);
        }
        
        return Math.round(totalMinutes / (diapers.length - 1));
    }

    private calculateTypeBreakdown(diapers: Diaper[]): Record<string, number> {
        const breakdown = {
            wet: 0,
            dirty: 0,
            both: 0
        };
        
        diapers.forEach(diaper => {
            breakdown[diaper.type]++;
        });
        
        return breakdown;
    }
}