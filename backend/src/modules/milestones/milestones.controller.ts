import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MilestonesService } from './milestones.service';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { MilestoneCategory } from '@/interfaces/milestone.interface';

@ApiTags('milestones')
@Controller('milestones')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new milestone' })
  create(@Body() createMilestoneDto: CreateMilestoneDto) {
    return this.milestonesService.create(createMilestoneDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all milestones' })
  findAll() {
    return this.milestonesService.findAll();
  }

  @Get('by-category')
  @ApiOperation({ summary: 'Get all milestones grouped by category' })
  getAllByCategory() {
    return this.milestonesService.getAllByCategory();
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get milestones by category' })
  findByCategory(@Param('category') category: MilestoneCategory) {
    return this.milestonesService.findByCategory(category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a milestone by ID' })
  findOne(@Param('id') id: string) {
    return this.milestonesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a milestone' })
  update(@Param('id') id: string, @Body() updateMilestoneDto: UpdateMilestoneDto) {
    return this.milestonesService.update(id, updateMilestoneDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a milestone' })
  remove(@Param('id') id: string) {
    return this.milestonesService.remove(id);
  }
}