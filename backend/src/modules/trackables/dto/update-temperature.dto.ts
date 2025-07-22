import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UpdateTrackableDto } from './update-trackable.dto';
import { TemperatureUnit, TemperatureLocation } from '../entities/temperature.entity';

export class UpdateTemperatureDto extends UpdateTrackableDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    value?: number;

    @ApiProperty({ enum: TemperatureUnit, required: false })
    @IsOptional()
    @IsEnum(TemperatureUnit)
    unit?: TemperatureUnit;

    @ApiProperty({ enum: TemperatureLocation, required: false })
    @IsOptional()
    @IsEnum(TemperatureLocation)
    location?: TemperatureLocation;
}