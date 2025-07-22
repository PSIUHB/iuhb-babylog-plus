import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateTrackableDto } from './create-trackable.dto';
import { DiaperType } from '../entities/diaper.entity';

export class CreateDiaperDto extends CreateTrackableDto {
    @ApiProperty({ enum: DiaperType })
    @IsEnum(DiaperType)
    type: DiaperType;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    consistency?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    color?: string;
}