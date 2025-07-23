import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BathsService } from '../services/baths.service';
import { CreateBathDto } from '../dto/create-bath.dto';
import { UpdateBathDto } from '../dto/update-bath.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/modules/users/entities/user.entity';

@ApiTags('baths')
@Controller('baths')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BathsController {
  constructor(private readonly bathsService: BathsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new bath record' })
  create(@Body() createBathDto: CreateBathDto, @CurrentUser() user: User) {
    return this.bathsService.create(createBathDto, user);
  }

  @Get('child/:childId')
  @ApiOperation({ summary: 'Get all bath records for a child' })
  findAll(@Param('childId') childId: string, @CurrentUser() user: User) {
    return this.bathsService.findAll(childId, user);
  }

  @Get('statistics/child/:childId')
  @ApiOperation({ summary: 'Get bath statistics for a child' })
  getStatistics(@Param('childId') childId: string, @CurrentUser() user: User) {
    return this.bathsService.getStatistics(childId, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific bath record' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.bathsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a bath record' })
  update(
    @Param('id') id: string,
    @Body() updateBathDto: UpdateBathDto,
    @CurrentUser() user: User,
  ) {
    return this.bathsService.update(id, updateBathDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a bath record' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.bathsService.remove(id, user);
  }
}