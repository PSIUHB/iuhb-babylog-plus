import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeedsService } from '../services/feeds.service';
import { CreateFeedDto } from '../dto/create-feed.dto';
import { UpdateFeedDto } from '../dto/update-feed.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/modules/users/entities/user.entity';

@ApiTags('feeds')
@Controller('feeds')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FeedsController {
  constructor(private readonly feedsService: FeedsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new feed record' })
  create(@Body() createFeedDto: CreateFeedDto, @CurrentUser() user: User) {
    return this.feedsService.create(createFeedDto, user);
  }

  @Get('child/:childId')
  @ApiOperation({ summary: 'Get all feed records for a child' })
  findAll(@Param('childId') childId: string, @CurrentUser() user: User) {
    return this.feedsService.findAll(childId, user);
  }

  @Get('statistics/child/:childId')
  @ApiOperation({ summary: 'Get feed statistics for a child' })
  getStatistics(@Param('childId') childId: string, @CurrentUser() user: User) {
    return this.feedsService.getStatistics(childId, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific feed record' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.feedsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a feed record' })
  update(
    @Param('id') id: string,
    @Body() updateFeedDto: UpdateFeedDto,
    @CurrentUser() user: User,
  ) {
    return this.feedsService.update(id, updateFeedDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a feed record' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.feedsService.remove(id, user);
  }
}