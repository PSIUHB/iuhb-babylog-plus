import { IsEnum, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateTrackableDto } from './create-trackable.dto';
import { WeightUnit } from '../entities/weight.entity';

export class CreateWeightDto extends CreateTrackableDto {
    @ApiProperty()
    @IsNumber()
    value: number;

    @ApiProperty({ enum: WeightUnit })
    @IsEnum(WeightUnit)
    unit: WeightUnit;
}