import { IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UpdateTrackableDto } from './update-trackable.dto';

export class UpdateBathDto extends UpdateTrackableDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    duration_minutes?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    water_temperature?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    products_used?: string;
}