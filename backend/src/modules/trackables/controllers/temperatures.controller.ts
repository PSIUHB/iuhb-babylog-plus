import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TemperaturesService } from '../services/temperatures.service';
import { CreateTemperatureDto } from '../dto/create-temperature.dto';
import { UpdateTemperatureDto } from '../dto/update-temperature.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/modules/users/entities/user.entity';

@ApiTags('temperatures')
@Controller('temperatures')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TemperaturesController {
  constructor(private readonly temperaturesService: TemperaturesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new temperature record' })
  create(@Body() createTemperatureDto: CreateTemperatureDto, @CurrentUser() user: User) {
    return this.temperaturesService.create(createTemperatureDto, user);
  }

  @Get('child/:childId')
  @ApiOperation({ summary: 'Get all temperature records for a child' })
  findAll(@Param('childId') childId: string, @CurrentUser() user: User) {
    return this.temperaturesService.findAll(childId, user);
  }

  @Get('statistics/child/:childId')
  @ApiOperation({ summary: 'Get temperature statistics for a child' })
  getStatistics(@Param('childId') childId: string, @CurrentUser() user: User) {
    return this.temperaturesService.getStatistics(childId, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific temperature record' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.temperaturesService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a temperature record' })
  update(
    @Param('id') id: string,
    @Body() updateTemperatureDto: UpdateTemperatureDto,
    @CurrentUser() user: User,
  ) {
    return this.temperaturesService.update(id, updateTemperatureDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a temperature record' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.temperaturesService.remove(id, user);
  }
}