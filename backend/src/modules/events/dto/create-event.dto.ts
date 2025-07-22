import { IsString, IsArray, IsEnum, IsDate, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EventType } from '@/interfaces/event.interface';
import { ApiProperty } from '@nestjs/swagger';
import {
    FeedingEventDataDto,
    DiaperEventDataDto,
    SleepEventDataDto,
    MedicineEventDataDto,
    TemperatureEventDataDto,
    WeightEventDataDto,
    HeightEventDataDto,
    ActivityEventDataDto,
    NoteEventDataDto,
    MilestoneEventDataDto
} from './event-data.dto';

export class CreateEventDto {
    @ApiProperty({ type: [String] })
    @IsArray()
    @IsString({ each: true })
    childIds: string[];

    @ApiProperty({ enum: EventType })
    @IsEnum(EventType)
    type: EventType;

    @ApiProperty({
        description: 'Event-specific data based on the event type',
        oneOf: [
            { $ref: '#/components/schemas/FeedingEventDataDto' },
            { $ref: '#/components/schemas/DiaperEventDataDto' },
            { $ref: '#/components/schemas/SleepEventDataDto' },
            { $ref: '#/components/schemas/MedicineEventDataDto' },
            { $ref: '#/components/schemas/TemperatureEventDataDto' },
            { $ref: '#/components/schemas/WeightEventDataDto' },
            { $ref: '#/components/schemas/HeightEventDataDto' },
            { $ref: '#/components/schemas/ActivityEventDataDto' },
            { $ref: '#/components/schemas/NoteEventDataDto' },
            { $ref: '#/components/schemas/MilestoneEventDataDto' }
        ]
    })
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

    @ApiProperty({ required: false, type: 'array', items: { type: 'object' } })
    @IsOptional()
    @IsArray()
    attachments?: Array<{
        url: string;
        type: string;
        name: string;
    }>;
}
