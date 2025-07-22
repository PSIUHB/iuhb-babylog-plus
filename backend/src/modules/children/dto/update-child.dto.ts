import { PartialType } from '@nestjs/swagger';
import { CreateChildDto } from './create-child.dto';
import { IsOptional, IsString, IsNumber, IsDate, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '@/interfaces/child.interface';

export class UpdateChildDto extends PartialType(CreateChildDto) {
  // Explicitly exclude id from being updated
  @IsOptional()
  @IsString()
  readonly id?: never;
}