import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Temperature, TemperatureUnit } from '../entities/temperature.entity';
import { TrackableService } from './trackable.service';
import { CreateTemperatureDto } from '../dto/create-temperature.dto';
import { UpdateTemperatureDto } from '../dto/update-temperature.dto';
import { ChildrenService } from '@/modules/children/children.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '@/modules/users/entities/user.entity';

@Injectable()
export class TemperaturesService extends TrackableService<Temperature, CreateTemperatureDto, UpdateTemperatureDto> {
    constructor(
        @InjectRepository(Temperature)
        private temperaturesRepository: Repository<Temperature>,
        @Inject(forwardRef(() => ChildrenService))
        childrenService: ChildrenService,
        eventEmitter: EventEmitter2
    ) {
        super(temperaturesRepository, childrenService, eventEmitter);
    }

    // Additional methods specific to temperatures

    async getStatistics(childId: string, user: User) {
        // Check if user has access to the child
        await this.childrenService.findOne(childId, user);

        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [last24hTemperatures, last7dTemperatures] = await Promise.all([
            this.temperaturesRepository.find({
                where: {
                    childId,
                    occurredAt: Between(last24h, now)
                },
                order: { occurredAt: 'ASC' }
            }),
            this.temperaturesRepository.find({
                where: {
                    childId,
                    occurredAt: Between(last7d, now)
                },
                order: { occurredAt: 'ASC' }
            })
        ]);

        return {
            last24h: {
                count: last24hTemperatures.length,
                average: this.calculateAverageTemperature(last24hTemperatures),
                min: this.findMinTemperature(last24hTemperatures),
                max: this.findMaxTemperature(last24hTemperatures),
                latest: this.getLatestTemperature(last24hTemperatures)
            },
            last7d: {
                count: last7dTemperatures.length,
                average: this.calculateAverageTemperature(last7dTemperatures),
                min: this.findMinTemperature(last7dTemperatures),
                max: this.findMaxTemperature(last7dTemperatures),
                latest: this.getLatestTemperature(last7dTemperatures)
            }
        };
    }

    private calculateAverageTemperature(temperatures: Temperature[]): number | null {
        if (temperatures.length === 0) return null;
        
        // Convert all temperatures to Celsius for calculation
        const celsiusValues = temperatures.map(temp => 
            temp.unit === TemperatureUnit.FAHRENHEIT 
                ? this.fahrenheitToCelsius(temp.value) 
                : temp.value
        );
        
        const sum = celsiusValues.reduce((total, value) => total + value, 0);
        return parseFloat((sum / celsiusValues.length).toFixed(1));
    }

    private findMinTemperature(temperatures: Temperature[]): { value: number, unit: TemperatureUnit } | null {
        if (temperatures.length === 0) return null;
        
        // Convert all to Celsius for comparison
        let minTemp = temperatures[0];
        let minCelsius = minTemp.unit === TemperatureUnit.FAHRENHEIT 
            ? this.fahrenheitToCelsius(minTemp.value) 
            : minTemp.value;
        
        for (const temp of temperatures.slice(1)) {
            const celsius = temp.unit === TemperatureUnit.FAHRENHEIT 
                ? this.fahrenheitToCelsius(temp.value) 
                : temp.value;
            
            if (celsius < minCelsius) {
                minCelsius = celsius;
                minTemp = temp;
            }
        }
        
        return { value: minTemp.value, unit: minTemp.unit };
    }

    private findMaxTemperature(temperatures: Temperature[]): { value: number, unit: TemperatureUnit } | null {
        if (temperatures.length === 0) return null;
        
        // Convert all to Celsius for comparison
        let maxTemp = temperatures[0];
        let maxCelsius = maxTemp.unit === TemperatureUnit.FAHRENHEIT 
            ? this.fahrenheitToCelsius(maxTemp.value) 
            : maxTemp.value;
        
        for (const temp of temperatures.slice(1)) {
            const celsius = temp.unit === TemperatureUnit.FAHRENHEIT 
                ? this.fahrenheitToCelsius(temp.value) 
                : temp.value;
            
            if (celsius > maxCelsius) {
                maxCelsius = celsius;
                maxTemp = temp;
            }
        }
        
        return { value: maxTemp.value, unit: maxTemp.unit };
    }

    private getLatestTemperature(temperatures: Temperature[]): { value: number, unit: TemperatureUnit } | null {
        if (temperatures.length === 0) return null;
        
        // Sort by date descending and get the first one
        const sorted = [...temperatures].sort((a, b) => 
            b.occurredAt.getTime() - a.occurredAt.getTime()
        );
        
        return { value: sorted[0].value, unit: sorted[0].unit };
    }

    private fahrenheitToCelsius(fahrenheit: number): number {
        return (fahrenheit - 32) * 5 / 9;
    }

    private celsiusToFahrenheit(celsius: number): number {
        return (celsius * 9 / 5) + 32;
    }
}