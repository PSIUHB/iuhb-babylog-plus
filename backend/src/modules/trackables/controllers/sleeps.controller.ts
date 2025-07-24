import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SleepsService } from '../services/sleeps.service';
import { CreateSleepDto } from '../dto/create-sleep.dto';
import { UpdateSleepDto } from '../dto/update-sleep.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/modules/users/entities/user.entity';

@ApiTags('sleeps')
@Controller('sleeps')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SleepsController {
  constructor(private readonly sleepsService: SleepsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sleep record' })
  create(@Body() createSleepDto: CreateSleepDto, @CurrentUser() user: User) {
    return this.sleepsService.create(createSleepDto, user);
  }

  @Get('child/:childId')
  @ApiOperation({ summary: 'Get all sleep records for a child' })
  findAll(@Param('childId') childId: string, @CurrentUser() user: User) {
    return this.sleepsService.findAll(childId, user);
  }

  @Get('statistics/child/:childId')
  @ApiOperation({ summary: 'Get sleep statistics for a child' })
  getStatistics(@Param('childId') childId: string, @CurrentUser() user: User) {
    return this.sleepsService.getStatistics(childId, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific sleep record' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.sleepsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a sleep record' })
  update(
    @Param('id') id: string,
    @Body() updateSleepDto: UpdateSleepDto,
    @CurrentUser() user: User,
  ) {
    console.log('HEHRHEHRHEHERH');
    return this.sleepsService.update(id, updateSleepDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a sleep record' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.sleepsService.remove(id, user);
  }
}