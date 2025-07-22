import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UpdateTrackableDto } from './update-trackable.dto';
import { WeightUnit } from '../entities/weight.entity';

export class UpdateWeightDto extends UpdateTrackableDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    value?: number;

    @ApiProperty({ enum: WeightUnit, required: false })
    @IsOptional()
    @IsEnum(WeightUnit)
    unit?: WeightUnit;
}