// src/modules/events/events.controller.ts
import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/modules/users/entities/user.entity';

@ApiTags('events')
@Controller('events')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EventsController {
    constructor(private readonly eventsService: EventsService) {}

    @Post()
    @ApiOperation({ summary: 'Create events for one or more children' })
    create(@Body() createEventDto: CreateEventDto, @CurrentUser() user: User) {
        return this.eventsService.create(createEventDto, user);
    }

    @Get('child/:childId')
    @ApiOperation({ summary: 'Get events for a specific child' })
    findByChild(
        @Param('childId') childId: string,
        @Query() query: any,
        @CurrentUser() user: User,
    ) {
        return this.eventsService.findByChild(childId, user, query);
    }

    @Get('family/:familyId')
    @ApiOperation({ summary: 'Get events for all children in a family' })
    findByFamily(
        @Param('familyId') familyId: string,
        @Query() query: any,
        @CurrentUser() user: User,
    ) {
        return this.eventsService.findByFamily(familyId, user, query);
    }

    @Get('statistics/child/:childId')
    @ApiOperation({ summary: 'Get statistics for a child' })
    getStatistics(
        @Param('childId') childId: string,
        @CurrentUser() user: User,
    ) {
        return this.eventsService.getStatistics(childId, user);
    }
}