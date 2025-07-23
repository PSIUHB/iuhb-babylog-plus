import { IsString, IsEnum, IsNumber, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MilestoneCategory } from '@/interfaces/milestone.interface';

// Base classes for event data validation

export class FeedingEventDataDto {
  @ApiProperty({
    description: 'The feeding method',
    enum: ['breast', 'bottle', 'solid'],
    example: 'bottle'
  })
  @IsString()
  @IsIn(['breast', 'bottle', 'solid'])
  method: 'breast' | 'bottle' | 'solid';

  @ApiProperty({
    description: 'The amount in milliliters (for bottle feeding)',
    example: 120,
    required: false
  })
  @IsOptional()
  @IsNumber()
  amount_ml?: number;

  @ApiProperty({
    description: 'The duration in minutes',
    example: 15,
    required: false
  })
  @IsOptional()
  @IsNumber()
  duration_minutes?: number;

  @ApiProperty({
    description: 'The breast side used (for breast feeding)',
    enum: ['left', 'right', 'both'],
    example: 'left',
    required: false
  })
  @IsOptional()
  @IsString()
  @IsIn(['left', 'right', 'both'])
  side?: 'left' | 'right' | 'both';

  @ApiProperty({
    description: 'The type of food (for solid feeding)',
    example: 'pureed carrots',
    required: false
  })
  @IsOptional()
  @IsString()
  food_type?: string;
}

export class DiaperEventDataDto {
  @ApiProperty({
    description: 'The diaper type',
    enum: ['wet', 'dirty', 'both'],
    example: 'wet'
  })
  @IsString()
  @IsIn(['wet', 'dirty', 'both'])
  type: 'wet' | 'dirty' | 'both';

  @ApiProperty({
    description: 'The consistency (for dirty diapers)',
    example: 'soft',
    required: false
  })
  @IsOptional()
  @IsString()
  consistency?: string;

  @ApiProperty({
    description: 'The color (for dirty diapers)',
    example: 'yellow',
    required: false
  })
  @IsOptional()
  @IsString()
  color?: string;
}

export class SleepEventDataDto {
  @ApiProperty({
    description: 'The sleep status',
    enum: ['start', 'end'],
    example: 'start'
  })
  @IsString()
  @IsIn(['start', 'end'])
  status: 'start' | 'end';

  @ApiProperty({
    description: 'The duration in minutes (for end status)',
    example: 120,
    required: false
  })
  @IsOptional()
  @IsNumber()
  duration_minutes?: number;

  @ApiProperty({
    description: 'The sleep quality (for end status)',
    enum: ['poor', 'fair', 'good'],
    example: 'good',
    required: false
  })
  @IsOptional()
  @IsString()
  @IsIn(['poor', 'fair', 'good'])
  quality?: 'poor' | 'fair' | 'good';

  @ApiProperty({
    description: 'The sleep location',
    example: 'crib',
    required: false
  })
  @IsOptional()
  @IsString()
  location?: string;
}

export class MedicineEventDataDto {
  @ApiProperty({
    description: 'The medicine name',
    example: 'Tylenol'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The dosage amount',
    example: '2.5'
  })
  @IsString()
  dosage: string;

  @ApiProperty({
    description: 'The dosage unit',
    example: 'ml'
  })
  @IsString()
  unit: string;

  @ApiProperty({
    description: 'The reason for giving medicine',
    example: 'fever',
    required: false
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class TemperatureEventDataDto {
  @ApiProperty({
    description: 'The temperature value',
    example: 37.5
  })
  @IsNumber()
  value: number;

  @ApiProperty({
    description: 'The temperature unit',
    enum: ['celsius', 'fahrenheit'],
    example: 'celsius'
  })
  @IsString()
  @IsIn(['celsius', 'fahrenheit'])
  unit: 'celsius' | 'fahrenheit';

  @ApiProperty({
    description: 'The measurement location',
    enum: ['oral', 'rectal', 'armpit', 'ear', 'forehead'],
    example: 'forehead',
    required: false
  })
  @IsOptional()
  @IsString()
  @IsIn(['oral', 'rectal', 'armpit', 'ear', 'forehead'])
  location?: 'oral' | 'rectal' | 'armpit' | 'ear' | 'forehead';
}

export class WeightEventDataDto {
  @ApiProperty({
    description: 'The weight value',
    example: 5.2
  })
  @IsNumber()
  value: number;

  @ApiProperty({
    description: 'The weight unit',
    enum: ['kg', 'lb'],
    example: 'kg'
  })
  @IsString()
  @IsIn(['kg', 'lb'])
  unit: 'kg' | 'lb';
}

export class HeightEventDataDto {
  @ApiProperty({
    description: 'The height value',
    example: 60.5
  })
  @IsNumber()
  value: number;

  @ApiProperty({
    description: 'The height unit',
    enum: ['cm', 'in'],
    example: 'cm'
  })
  @IsString()
  @IsIn(['cm', 'in'])
  unit: 'cm' | 'in';
}

export class ActivityEventDataDto {
  @ApiProperty({
    description: 'The activity name',
    example: 'Tummy time'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The duration in minutes',
    example: 15,
    required: false
  })
  @IsOptional()
  @IsNumber()
  duration_minutes?: number;

  @ApiProperty({
    description: 'The activity description',
    example: 'Baby enjoyed tummy time on the play mat',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class NoteEventDataDto {
  @ApiProperty({
    description: 'The note title',
    example: 'Doctor visit',
    required: false
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'The note content',
    example: 'Baby had a checkup and is doing well'
  })
  @IsString()
  content: string;
}

export class MilestoneEventDataDto {
  @ApiProperty({
    description: 'The milestone ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  milestoneId: string;

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
  @IsNumber({}, { each: true })
  ageRangeMonths: [number, number];

  @ApiProperty({
    description: 'The date when the milestone was achieved',
    example: '2023-01-15T12:00:00Z'
  })
  @IsString()
  achievedDate: string;
}