import { IsEnum, IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateTrackableDto } from './create-trackable.dto';
import { FeedingMethod, BreastSide } from '../entities/feed.entity';

export class CreateFeedDto extends CreateTrackableDto {
    @ApiProperty({ enum: FeedingMethod })
    @IsEnum(FeedingMethod)
    method: FeedingMethod;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    amount_ml?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    duration_minutes?: number;

    @ApiProperty({ enum: BreastSide, required: false })
    @IsOptional()
    @IsEnum(BreastSide)
    side?: BreastSide;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    food_type?: string;
}