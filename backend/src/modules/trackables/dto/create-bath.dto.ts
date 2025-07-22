import { IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateTrackableDto } from './create-trackable.dto';

export class CreateBathDto extends CreateTrackableDto {
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