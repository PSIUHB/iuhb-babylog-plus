import { IsOptional, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    firstName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    lastName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ required: false, description: 'URL to the user avatar image' })
    @IsOptional()
    @IsString()
    avatarUrl?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    locale?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    timezone?: string;
}