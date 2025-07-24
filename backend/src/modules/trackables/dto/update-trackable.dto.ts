import { IsString, IsDate, IsOptional, IsArray, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTrackableDto {
    @ApiProperty({ type: Date, required: false })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    occurredAt?: Date;

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

    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID()
    childId?: string;
}