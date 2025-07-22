import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateTrackableDto } from './create-trackable.dto';
import { TemperatureUnit, TemperatureLocation } from '../entities/temperature.entity';

export class CreateTemperatureDto extends CreateTrackableDto {
    @ApiProperty()
    @IsNumber()
    value: number;

    @ApiProperty({ enum: TemperatureUnit })
    @IsEnum(TemperatureUnit)
    unit: TemperatureUnit;

    @ApiProperty({ enum: TemperatureLocation, required: false })
    @IsOptional()
    @IsEnum(TemperatureLocation)
    location?: TemperatureLocation;
}