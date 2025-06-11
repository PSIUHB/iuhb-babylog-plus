import { IsString, IsDate, IsEnum, IsOptional, IsHexColor, IsNumber, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '../entities/child.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChildDto {
    @ApiProperty()
    @IsString()
    firstName: string;

    @ApiProperty()
    @IsString()
    lastName: string;

    @ApiProperty({ type: Date })
    @IsDate()
    @Type(() => Date)
    birthDate: Date;

    @ApiProperty({ enum: Gender })
    @IsEnum(Gender)
    gender: Gender;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsHexColor()
    colorHex?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    birthWeightKg?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    birthHeightCm?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsObject()
    medicalInfo?: Record<string, any>;
}