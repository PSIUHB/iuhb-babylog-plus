import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Bath } from '../entities/bath.entity';
import { TrackableService } from './trackable.service';
import { CreateBathDto } from '../dto/create-bath.dto';
import { UpdateBathDto } from '../dto/update-bath.dto';
import { ChildrenService } from '@/modules/children/children.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '@/modules/users/entities/user.entity';

@Injectable()
export class BathsService extends TrackableService<Bath, CreateBathDto, UpdateBathDto> {
    constructor(
        @InjectRepository(Bath)
        private bathsRepository: Repository<Bath>,
        @Inject(forwardRef(() => ChildrenService))
        childrenService: ChildrenService,
        eventEmitter: EventEmitter2
    ) {
        super(bathsRepository, childrenService, eventEmitter);
    }

    // Additional methods specific to baths

    async getStatistics(childId: string, user: User) {
        // Check if user has access to the child
        await this.childrenService.findOne(childId, user);

        const now = new Date();
        const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [last7dBaths, last30dBaths] = await Promise.all([
            this.bathsRepository.find({
                where: {
                    childId,
                    occurredAt: Between(last7d, now)
                },
                order: { occurredAt: 'ASC' }
            }),
            this.bathsRepository.find({
                where: {
                    childId,
                    occurredAt: Between(last30d, now)
                },
                order: { occurredAt: 'ASC' }
            })
        ]);

        return {
            last7d: {
                count: last7dBaths.length,
                averageDuration: this.calculateAverageDuration(last7dBaths),
                averageWaterTemperature: this.calculateAverageWaterTemperature(last7dBaths),
                mostUsedProducts: this.findMostUsedProducts(last7dBaths),
                daysSinceLastBath: this.calculateDaysSinceLastBath(last7dBaths)
            },
            last30d: {
                count: last30dBaths.length,
                averageDuration: this.calculateAverageDuration(last30dBaths),
                averageWaterTemperature: this.calculateAverageWaterTemperature(last30dBaths),
                mostUsedProducts: this.findMostUsedProducts(last30dBaths),
                frequency: this.calculateFrequency(last30dBaths)
            }
        };
    }

    private calculateAverageDuration(baths: Bath[]): number {
        const bathsWithDuration = baths.filter(b => b.duration_minutes);
        if (bathsWithDuration.length === 0) return 0;
        
        const total = bathsWithDuration.reduce((sum, bath) => sum + bath.duration_minutes, 0);
        return Math.round(total / bathsWithDuration.length);
    }

    private calculateAverageWaterTemperature(baths: Bath[]): number {
        const bathsWithTemp = baths.filter(b => b.water_temperature);
        if (bathsWithTemp.length === 0) return 0;
        
        const total = bathsWithTemp.reduce((sum, bath) => sum + bath.water_temperature, 0);
        return parseFloat((total / bathsWithTemp.length).toFixed(1));
    }

    private findMostUsedProducts(baths: Bath[]): string[] {
        const productCounts = new Map<string, number>();
        
        baths.forEach(bath => {
            if (bath.products_used) {
                const products = bath.products_used.split(',').map(p => p.trim());
                products.forEach(product => {
                    productCounts.set(product, (productCounts.get(product) || 0) + 1);
                });
            }
        });
        
        // Convert to array and sort by count
        const sortedProducts = Array.from(productCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .map(entry => entry[0]);
        
        // Return top 3 most used products
        return sortedProducts.slice(0, 3);
    }

    private calculateDaysSinceLastBath(baths: Bath[]): number | null {
        if (baths.length === 0) return null;
        
        // Sort by date descending and get the first one
        const sorted = [...baths].sort((a, b) => 
            b.occurredAt.getTime() - a.occurredAt.getTime()
        );
        
        const lastBathDate = sorted[0].occurredAt;
        const now = new Date();
        
        // Calculate days difference
        return Math.floor((now.getTime() - lastBathDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    private calculateFrequency(baths: Bath[]): number | null {
        if (baths.length < 2) return null;
        
        // Sort by date ascending
        const sorted = [...baths].sort((a, b) => 
            a.occurredAt.getTime() - b.occurredAt.getTime()
        );
        
        const first = sorted[0].occurredAt;
        const last = sorted[sorted.length - 1].occurredAt;
        
        // Calculate days between first and last bath
        const daysDiff = (last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysDiff === 0) return 0;
        
        // Calculate average days between baths
        return parseFloat((daysDiff / (sorted.length - 1)).toFixed(1));
    }
}