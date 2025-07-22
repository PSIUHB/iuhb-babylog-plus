import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Feed } from '../entities/feed.entity';
import { TrackableService } from './trackable.service';
import { CreateFeedDto } from '../dto/create-feed.dto';
import { UpdateFeedDto } from '../dto/update-feed.dto';
import { ChildrenService } from '@/modules/children/children.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '@/modules/users/entities/user.entity';

@Injectable()
export class FeedsService extends TrackableService<Feed, CreateFeedDto, UpdateFeedDto> {
    constructor(
        @InjectRepository(Feed)
        private feedsRepository: Repository<Feed>,
        childrenService: ChildrenService,
        eventEmitter: EventEmitter2
    ) {
        super(feedsRepository, childrenService, eventEmitter);
    }

    // Additional methods specific to feeds

    async getStatistics(childId: string, user: User) {
        // Check if user has access to the child
        await this.childrenService.findOne(childId, user);

        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [last24hFeeds, last7dFeeds] = await Promise.all([
            this.feedsRepository.find({
                where: {
                    childId,
                    occurredAt: Between(last24h, now)
                },
                order: { occurredAt: 'ASC' }
            }),
            this.feedsRepository.find({
                where: {
                    childId,
                    occurredAt: Between(last7d, now)
                },
                order: { occurredAt: 'ASC' }
            })
        ]);

        return {
            last24h: {
                count: last24hFeeds.length,
                averageInterval: this.calculateAverageInterval(last24hFeeds),
                totalVolume: this.calculateTotalVolume(last24hFeeds),
                averageVolume: this.calculateAverageVolume(last24hFeeds),
                methodBreakdown: this.calculateMethodBreakdown(last24hFeeds)
            },
            last7d: {
                count: last7dFeeds.length,
                averageInterval: this.calculateAverageInterval(last7dFeeds),
                totalVolume: this.calculateTotalVolume(last7dFeeds),
                averageVolume: this.calculateAverageVolume(last7dFeeds),
                methodBreakdown: this.calculateMethodBreakdown(last7dFeeds)
            }
        };
    }

    private calculateAverageInterval(feeds: Feed[]): number {
        if (feeds.length < 2) return 0;
        
        let totalMinutes = 0;
        for (let i = 1; i < feeds.length; i++) {
            const diff = feeds[i].occurredAt.getTime() - feeds[i-1].occurredAt.getTime();
            totalMinutes += diff / (1000 * 60);
        }
        
        return Math.round(totalMinutes / (feeds.length - 1));
    }

    private calculateTotalVolume(feeds: Feed[]): number {
        return feeds.reduce((total, feed) => {
            return total + (feed.amount_ml || 0);
        }, 0);
    }

    private calculateAverageVolume(feeds: Feed[]): number {
        const bottleFeeds = feeds.filter(f => f.method === 'bottle' && f.amount_ml);
        if (bottleFeeds.length === 0) return 0;
        
        const total = bottleFeeds.reduce((sum, feed) => sum + feed.amount_ml, 0);
        return Math.round(total / bottleFeeds.length);
    }

    private calculateMethodBreakdown(feeds: Feed[]): Record<string, number> {
        const breakdown = {
            breast: 0,
            bottle: 0,
            solid: 0
        };
        
        feeds.forEach(feed => {
            breakdown[feed.method]++;
        });
        
        return breakdown;
    }
}