import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WeightsService } from '../services/weights.service';
import { CreateWeightDto } from '../dto/create-weight.dto';
import { UpdateWeightDto } from '../dto/update-weight.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/modules/users/entities/user.entity';

@ApiTags('weights')
@Controller('weights')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WeightsController {
  constructor(private readonly weightsService: WeightsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new weight record' })
  create(@Body() createWeightDto: CreateWeightDto, @CurrentUser() user: User) {
    return this.weightsService.create(createWeightDto, user);
  }

  @Get('child/:childId')
  @ApiOperation({ summary: 'Get all weight records for a child' })
  findAll(@Param('childId') childId: string, @CurrentUser() user: User) {
    return this.weightsService.findAll(childId, user);
  }

  @Get('statistics/child/:childId')
  @ApiOperation({ summary: 'Get weight statistics for a child' })
  getStatistics(@Param('childId') childId: string, @CurrentUser() user: User) {
    return this.weightsService.getStatistics(childId, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific weight record' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.weightsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a weight record' })
  update(
    @Param('id') id: string,
    @Body() updateWeightDto: UpdateWeightDto,
    @CurrentUser() user: User,
  ) {
    return this.weightsService.update(id, updateWeightDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a weight record' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.weightsService.remove(id, user);
  }
}