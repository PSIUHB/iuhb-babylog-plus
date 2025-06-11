import { IsString, IsArray, IsEnum, IsDate, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EventType } from '../entities/event.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
    @ApiProperty({ type: [String] })
    @IsArray()
    @IsString({ each: true })
    childIds: string[];

    @ApiProperty({ enum: EventType })
    @IsEnum(EventType)
    type: EventType;

    @ApiProperty()
    @IsObject()
    data: Record<string, any>;

    @ApiProperty({ type: Date })
    @IsDate()
    @Type(() => Date)
    occurredAt: Date;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}