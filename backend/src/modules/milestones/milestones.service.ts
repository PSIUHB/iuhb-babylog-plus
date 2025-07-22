import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Milestone } from './entities/milestone.entity';
import { MilestoneCategory, MILESTONES } from '@/interfaces/milestone.interface';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';

@Injectable()
export class MilestonesService {
  constructor(
    @InjectRepository(Milestone)
    private milestonesRepository: Repository<Milestone>,
  ) {}

  /**
   * Create a new milestone
   */
  async create(createMilestoneDto: CreateMilestoneDto): Promise<Milestone> {
    // Ensure milestone property is not null or empty
    if (!createMilestoneDto.milestone) {
      throw new BadRequestException('Milestone description cannot be empty or null');
    }
    
    const milestone = this.milestonesRepository.create(createMilestoneDto);
    return this.milestonesRepository.save(milestone);
  }

  /**
   * Find all milestones
   */
  async findAll(): Promise<Milestone[]> {
    return this.milestonesRepository.find();
  }

  /**
   * Find all milestones by category
   */
  async findByCategory(category: MilestoneCategory): Promise<Milestone[]> {
    return this.milestonesRepository.find({ where: { category } });
  }

  /**
   * Find a milestone by ID
   */
  async findOne(id: string): Promise<Milestone | null> {
    return this.milestonesRepository.findOne({ where: { id } });
  }

  /**
   * Update a milestone
   */
  async update(id: string, updateMilestoneDto: UpdateMilestoneDto): Promise<Milestone | null> {
    // Find the existing milestone
    const existingMilestone = await this.findOne(id);
    if (!existingMilestone) {
      return null;
    }

    // Ensure milestone property is not set to null
    if (updateMilestoneDto.milestone === null || updateMilestoneDto.milestone === undefined) {
      // Remove the milestone property to prevent it from being updated to null
      const { milestone, ...restDto } = updateMilestoneDto;
      await this.milestonesRepository.update(id, restDto);
    } else {
      await this.milestonesRepository.update(id, updateMilestoneDto);
    }
    
    return this.findOne(id);
  }

  /**
   * Remove a milestone
   */
  async remove(id: string): Promise<void> {
    await this.milestonesRepository.delete(id);
  }

  /**
   * Get all milestones grouped by category
   */
  async getAllByCategory(): Promise<Record<MilestoneCategory, Milestone[]>> {
    try {
      let milestones = await this.findAll();
      console.log('Found milestones in database:', milestones.length);

      // If no milestones found, try to seed the database
      if (!milestones || milestones.length === 0) {
        console.warn('No milestones found in database. Attempting to seed milestones...');
        await this.seedMilestones();
        milestones = await this.findAll();
        console.log('After seeding, found milestones:', milestones.length);
      }

      // Initialize with empty arrays for all categories to ensure consistent structure
      const result: Record<MilestoneCategory, Milestone[]> = {
        [MilestoneCategory.MOTOR_DEVELOPMENT]: [],
        [MilestoneCategory.COMMUNICATION_LANGUAGE]: [],
        [MilestoneCategory.COGNITIVE_DEVELOPMENT]: [],
        [MilestoneCategory.SOCIAL_EMOTIONAL]: [],
        [MilestoneCategory.SELF_CARE]: [],
        [MilestoneCategory.PHYSICAL_GROWTH]: []
      };

      // Group milestones by category
      milestones.forEach(milestone => {
        if (result[milestone.category]) {
          result[milestone.category].push(milestone);
        } else {
          console.warn(`Unknown milestone category: ${milestone.category}`);
        }
      });

      // Log category counts for debugging
      Object.entries(result).forEach(([category, items]) => {
        console.log(`Category ${category}: ${items.length} milestones`);
      });

      return result;
    } catch (error) {
      console.error('Error in getAllByCategory:', error);
      // Return empty structure on error
      return {
        [MilestoneCategory.MOTOR_DEVELOPMENT]: [],
        [MilestoneCategory.COMMUNICATION_LANGUAGE]: [],
        [MilestoneCategory.COGNITIVE_DEVELOPMENT]: [],
        [MilestoneCategory.SOCIAL_EMOTIONAL]: [],
        [MilestoneCategory.SELF_CARE]: [],
        [MilestoneCategory.PHYSICAL_GROWTH]: []
      };
    }
  }

  /**
   * Seed milestones from the predefined MILESTONES constant
   */
  private async seedMilestones(): Promise<void> {
    try {
      console.log('Seeding milestones from MILESTONES constant...');

      const milestonesToCreate: CreateMilestoneDto[] = [];

      // Convert MILESTONES constant to CreateMilestoneDto array
      for (const category of Object.values(MilestoneCategory)) {
        const categoryMilestones = MILESTONES[category];
        if (categoryMilestones && Array.isArray(categoryMilestones)) {
          categoryMilestones.forEach(milestone => {
            milestonesToCreate.push({
              category: milestone.category,
              milestone: milestone.milestone,
              expectedAgeMonths: milestone.expectedAgeMonths,
              ageRangeMonths: milestone.ageRangeMonths
            });
          });
        }
      }

      console.log(`Creating ${milestonesToCreate.length} milestones...`);

      // Batch create all milestones
      for (const milestoneDto of milestonesToCreate) {
        try {
          await this.create(milestoneDto);
        } catch (error) {
          console.error(`Error creating milestone "${milestoneDto.milestone}":`, error);
        }
      }

      console.log('Milestone seeding completed.');
    } catch (error) {
      console.error('Error seeding milestones:', error);
    }
  }
}