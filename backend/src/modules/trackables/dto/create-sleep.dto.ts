import { IsEnum, IsNumber, IsString, IsOptional, IsBoolean, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateTrackableDto } from './create-trackable.dto';
import { 
    SleepQuality,
    SleepType, 
    FallAsleepMethod, 
    WakeUpBehavior, 
    WakeUpReason 
} from '../entities/sleep.entity';
import { Type } from 'class-transformer';

export class CreateSleepDto extends CreateTrackableDto {

    @ApiProperty({ enum: SleepType, required: false })
    @IsOptional()
    @IsEnum(SleepType)
    sleepType?: SleepType;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    startTime?: Date;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    endTime?: Date;

    @ApiProperty({ enum: SleepQuality, required: false })
    @IsOptional()
    @IsEnum(SleepQuality)
    quality?: SleepQuality;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiProperty({ enum: FallAsleepMethod, required: false })
    @IsOptional()
    @IsEnum(FallAsleepMethod)
    fallAsleepMethod?: FallAsleepMethod;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    startNotes?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    environment?: string;

    @ApiProperty({ enum: WakeUpBehavior, required: false })
    @IsOptional()
    @IsEnum(WakeUpBehavior)
    wakeUpBehavior?: WakeUpBehavior;

    @ApiProperty({ enum: WakeUpReason, required: false })
    @IsOptional()
    @IsEnum(WakeUpReason)
    wakeUpReason?: WakeUpReason;

    @ApiProperty({ required: false, default: false })
    @IsOptional()
    @IsBoolean()
    isEstimated?: boolean;
}