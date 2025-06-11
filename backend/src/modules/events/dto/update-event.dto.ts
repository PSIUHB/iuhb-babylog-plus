import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateEventDto } from './create-event.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateEventDto extends PartialType(
    OmitType(CreateEventDto, ['childIds'] as const)
) {
    @IsOptional()
    @IsBoolean()
    isDeleted?: boolean;
}