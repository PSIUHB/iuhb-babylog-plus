import { IsString, IsEnum, IsArray, IsNumber, IsOptional, IsDateString, ValidateNested, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MilestoneCategory } from '@/interfaces/milestone.interface';

export class CreateMilestoneEventDto {
  @ApiProperty({
    description: 'The ID of the child this milestone is for',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  childId: string;

  @ApiProperty({
    description: 'The category of the milestone',
    enum: MilestoneCategory,
    example: MilestoneCategory.MOTOR_DEVELOPMENT
  })
  @IsEnum(MilestoneCategory)
  category: MilestoneCategory;

  @ApiProperty({
    description: 'The milestone description',
    example: 'First smile (social)'
  })
  @IsString()
  milestone: string;

  @ApiProperty({
    description: 'The expected age in months for this milestone',
    example: 2
  })
  @IsNumber()
  expectedAgeMonths: number;

  @ApiProperty({
    description: 'The age range in months for this milestone [min, max]',
    example: [1, 3]
  })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  ageRangeMonths: [number, number];

  @ApiProperty({
    description: 'The date when the milestone was achieved',
    example: '2023-01-15T12:00:00Z'
  })
  @IsDateString()
  achievedDate: string;

  @ApiProperty({
    description: 'Optional notes about the milestone',
    example: 'Baby smiled at mom for the first time',
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;
}