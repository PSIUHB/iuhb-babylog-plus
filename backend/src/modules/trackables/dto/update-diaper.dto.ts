import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UpdateTrackableDto } from './update-trackable.dto';
import { DiaperType } from '../entities/diaper.entity';

export class UpdateDiaperDto extends UpdateTrackableDto {
    @ApiProperty({ enum: DiaperType, required: false })
    @IsOptional()
    @IsEnum(DiaperType)
    type?: DiaperType;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    consistency?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    color?: string;
}