import { IsEnum, IsNotEmpty, IsNumber, IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MilestoneCategory } from '@/interfaces/milestone.interface';

export class CreateMilestoneDto {
  @ApiProperty({
    enum: MilestoneCategory,
    description: 'The category of the milestone',
  })
  @IsEnum(MilestoneCategory)
  @IsNotEmpty()
  category: MilestoneCategory;

  @ApiProperty({
    description: 'The milestone description',
  })
  @IsNotEmpty()
  milestone: string;

  @ApiProperty({
    description: 'The expected age in months when this milestone is typically achieved',
  })
  @IsNumber()
  @IsNotEmpty()
  expectedAgeMonths: number;

  @ApiProperty({
    description: 'The age range in months when this milestone is typically achieved [min, max]',
    type: [Number],
  })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  ageRangeMonths: number[];
}