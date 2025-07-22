import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Weight, WeightUnit } from '../entities/weight.entity';
import { TrackableService } from './trackable.service';
import { CreateWeightDto } from '../dto/create-weight.dto';
import { UpdateWeightDto } from '../dto/update-weight.dto';
import { ChildrenService } from '@/modules/children/children.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '@/modules/users/entities/user.entity';

@Injectable()
export class WeightsService extends TrackableService<Weight, CreateWeightDto, UpdateWeightDto> {
    constructor(
        @InjectRepository(Weight)
        private weightsRepository: Repository<Weight>,
        childrenService: ChildrenService,
        eventEmitter: EventEmitter2
    ) {
        super(weightsRepository, childrenService, eventEmitter);
    }

    // Additional methods specific to weights

    async getStatistics(childId: string, user: User) {
        // Check if user has access to the child
        await this.childrenService.findOne(childId, user);

        const now = new Date();
        const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const last6m = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

        const [last30dWeights, last6mWeights, allWeights] = await Promise.all([
            this.weightsRepository.find({
                where: {
                    childId,
                    occurredAt: Between(last30d, now)
                },
                order: { occurredAt: 'ASC' }
            }),
            this.weightsRepository.find({
                where: {
                    childId,
                    occurredAt: Between(last6m, now)
                },
                order: { occurredAt: 'ASC' }
            }),
            this.weightsRepository.find({
                where: { childId },
                order: { occurredAt: 'ASC' }
            })
        ]);

        return {
            last30d: {
                count: last30dWeights.length,
                latest: this.getLatestWeight(last30dWeights),
                change: this.calculateWeightChange(last30dWeights),
                growthRate: this.calculateGrowthRate(last30dWeights)
            },
            last6m: {
                count: last6mWeights.length,
                latest: this.getLatestWeight(last6mWeights),
                change: this.calculateWeightChange(last6mWeights),
                growthRate: this.calculateGrowthRate(last6mWeights)
            },
            all: {
                count: allWeights.length,
                latest: this.getLatestWeight(allWeights),
                change: this.calculateWeightChange(allWeights),
                growthRate: this.calculateGrowthRate(allWeights)
            }
        };
    }

    private getLatestWeight(weights: Weight[]): { value: number, unit: WeightUnit } | null {
        if (weights.length === 0) return null;
        
        // Sort by date descending and get the first one
        const sorted = [...weights].sort((a, b) => 
            b.occurredAt.getTime() - a.occurredAt.getTime()
        );
        
        return { value: sorted[0].value, unit: sorted[0].unit };
    }

    private calculateWeightChange(weights: Weight[]): { value: number, unit: WeightUnit } | null {
        if (weights.length < 2) return null;
        
        // Sort by date ascending
        const sorted = [...weights].sort((a, b) => 
            a.occurredAt.getTime() - b.occurredAt.getTime()
        );
        
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        
        // Convert to kg for calculation if needed
        const firstKg = first.unit === WeightUnit.LB ? this.lbToKg(first.value) : first.value;
        const lastKg = last.unit === WeightUnit.LB ? this.lbToKg(last.value) : last.value;
        
        const changeKg = lastKg - firstKg;
        
        // Return in the same unit as the latest measurement
        if (last.unit === WeightUnit.LB) {
            return { value: this.kgToLb(changeKg), unit: WeightUnit.LB };
        } else {
            return { value: changeKg, unit: WeightUnit.KG };
        }
    }

    private calculateGrowthRate(weights: Weight[]): number | null {
        if (weights.length < 2) return null;
        
        // Sort by date ascending
        const sorted = [...weights].sort((a, b) => 
            a.occurredAt.getTime() - b.occurredAt.getTime()
        );
        
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        
        // Convert to kg for calculation if needed
        const firstKg = first.unit === WeightUnit.LB ? this.lbToKg(first.value) : first.value;
        const lastKg = last.unit === WeightUnit.LB ? this.lbToKg(last.value) : last.value;
        
        // Calculate days between measurements
        const daysDiff = (last.occurredAt.getTime() - first.occurredAt.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysDiff === 0) return 0;
        
        // Calculate growth rate in kg per day
        const growthRatePerDay = (lastKg - firstKg) / daysDiff;
        
        // Convert to growth rate per month (approximate)
        return parseFloat((growthRatePerDay * 30).toFixed(2));
    }

    private lbToKg(lb: number): number {
        return lb * 0.45359237;
    }

    private kgToLb(kg: number): number {
        return kg / 0.45359237;
    }
}