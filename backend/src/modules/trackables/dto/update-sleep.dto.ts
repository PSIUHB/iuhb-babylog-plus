import { IsEnum, IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UpdateTrackableDto } from './update-trackable.dto';
import { SleepStatus, SleepQuality } from '../entities/sleep.entity';

export class UpdateSleepDto extends UpdateTrackableDto {
    @ApiProperty({ enum: SleepStatus, required: false })
    @IsOptional()
    @IsEnum(SleepStatus)
    status?: SleepStatus;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    duration_minutes?: number;

    @ApiProperty({ enum: SleepQuality, required: false })
    @IsOptional()
    @IsEnum(SleepQuality)
    quality?: SleepQuality;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    location?: string;
}