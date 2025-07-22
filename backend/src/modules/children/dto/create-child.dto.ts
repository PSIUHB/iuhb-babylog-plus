import { IsString, IsDate, IsEnum, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '@/interfaces/child.interface';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChildDto {
    @ApiProperty({ required: true })
    @IsString()
    firstName: string;

    @ApiProperty({ required: true })
    @IsString()
    lastName: string;
    
    @ApiProperty({ required: false, description: 'Alternative to firstName and lastName for simplified forms' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ type: Date })
    @IsDate()
    @Type(() => Date)
    birthDate: Date;

    @ApiProperty({ enum: Gender })
    @IsEnum(Gender)
    gender: Gender;

    
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    avatarUrl?: string;
    
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;
    
    @ApiProperty({ required: false, default: 'active', description: 'Status of the child (active, inactive, etc.)' })
    @IsOptional()
    @IsString()
    status?: string;
    
    @ApiProperty({ required: false, description: 'Shorthand for status (true = active, false = inactive)' })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiProperty({ required: false, description: 'Birth weight in kilograms' })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    birthWeightKg?: number;

    @ApiProperty({ required: false, description: 'Birth height in centimeters' })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    birthHeightCm?: number;
}
