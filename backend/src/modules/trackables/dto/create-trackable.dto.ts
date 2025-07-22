import { IsString, IsDate, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTrackableDto {
    @ApiProperty()
    @IsString()
    childId: string;

    @ApiProperty({ type: Date })
    @IsDate()
    @Type(() => Date)
    occurredAt: Date;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ required: false, type: 'array', items: { type: 'object' } })
    @IsOptional()
    @IsArray()
    attachments?: Array<{
        url: string;
        type: string;
        name: string;
    }>;
}