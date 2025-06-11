import { PartialType } from '@nestjs/swagger';
import { CreateChildDto } from './create-child.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateChildDto extends PartialType(CreateChildDto) {
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}