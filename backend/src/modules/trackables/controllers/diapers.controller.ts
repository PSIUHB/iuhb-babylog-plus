import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DiapersService } from '../services/diapers.service';
import { CreateDiaperDto } from '../dto/create-diaper.dto';
import { UpdateDiaperDto } from '../dto/update-diaper.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/modules/users/entities/user.entity';

@ApiTags('diapers')
@Controller('diapers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DiapersController {
  constructor(private readonly diapersService: DiapersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new diaper record' })
  create(@Body() createDiaperDto: CreateDiaperDto, @CurrentUser() user: User) {
    return this.diapersService.create(createDiaperDto, user);
  }

  @Get('child/:childId')
  @ApiOperation({ summary: 'Get all diaper records for a child' })
  findAll(@Param('childId') childId: string, @CurrentUser() user: User) {
    return this.diapersService.findAll(childId, user);
  }

  @Get('statistics/child/:childId')
  @ApiOperation({ summary: 'Get diaper statistics for a child' })
  getStatistics(@Param('childId') childId: string, @CurrentUser() user: User) {
    return this.diapersService.getStatistics(childId, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific diaper record' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.diapersService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a diaper record' })
  update(
    @Param('id') id: string,
    @Body() updateDiaperDto: UpdateDiaperDto,
    @CurrentUser() user: User,
  ) {
    return this.diapersService.update(id, updateDiaperDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a diaper record' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.diapersService.remove(id, user);
  }
}