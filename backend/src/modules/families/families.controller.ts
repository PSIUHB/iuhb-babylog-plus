// src/modules/families/families.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
    Request,
    OnModuleInit,
    NotFoundException,
    ForbiddenException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FamiliesService } from './families.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/modules/users/entities/user.entity';

@ApiTags('families')
@Controller('families')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FamiliesController implements OnModuleInit {
    constructor(private readonly familiesService: FamiliesService) {}

    async onModuleInit() {
        await this.familiesService.updateInvitationsConsistency();
    }

    @Post()
    @ApiOperation({ summary: 'Create a new family' })
    create(
        @Body() createFamilyDto: CreateFamilyDto,
        @CurrentUser() user: User,
    ) {
        return this.familiesService.create(createFamilyDto, user);
    }

    @Get()
    @ApiOperation({ summary: 'Get all families for current user' })
    findAll(@CurrentUser() user: User) {
        return this.familiesService.findAll(user.id);
    }

    @Get('invitation')
    @ApiOperation({ summary: 'Get pending invitations for current user' })
    async getPendingInvitations(@CurrentUser() user: User) {
        return this.familiesService.getPendingInvitations(user.email);
    }

    @Get('invitation/:invitationId')
    @ApiOperation({ summary: 'Get a specific invitation by ID' })
    async getInvitationById(@Param('invitationId') invitationId: string, @CurrentUser() user: User) {
        return this.familiesService.getInvitationById(invitationId, user.email);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get family by id' })
    findOne(@Param('id') id: string, @CurrentUser() user: User) {
        return this.familiesService.findOne(id, user.id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update family' })
    update(
        @Param('id') id: string,
        @Body() updateFamilyDto: UpdateFamilyDto,
        @CurrentUser() user: User,
    ) {
        return this.familiesService.update(id, updateFamilyDto, user.id);
    }

    @Post(':id/invite')
    @ApiOperation({ summary: 'Invite a member to family' })
    inviteMember(
        @Param('id') id: string,
        @Body() inviteMemberDto: InviteMemberDto,
        @CurrentUser() user: User,
    ) {
        return this.familiesService.inviteMember(id, inviteMemberDto, user.id);
    }

    @Post('join/:code')
    @ApiOperation({ summary: 'Join a family using invite code or invitation token' })
    joinFamily(
        @Param('code') code: string,
        @CurrentUser() user: User,
    ) {
        return this.familiesService.joinFamily(code, user.id);
    }

    @Patch(':id/members/:memberId')
    @ApiOperation({ summary: 'Update family member role' })
    updateFamilyMember(
        @Param('id') familyId: string,
        @Param('memberId') memberId: string,
        @Body() updateData: { role: string },
        @CurrentUser() user: User,
    ) {
        return this.familiesService.updateFamilyMember(familyId, memberId, updateData, user.id);
    }

    @Delete(':id/members/:memberId')
    @ApiOperation({ summary: 'Remove family member' })
    removeFamilyMember(
        @Param('id') familyId: string,
        @Param('memberId') memberId: string,
        @CurrentUser() user: User,
    ) {
        return this.familiesService.removeFamilyMember(familyId, memberId, user.id);
    }

    @Delete(':id/leave')
    @ApiOperation({ summary: 'Leave a family' })
    leaveFamily(
        @Param('id') id: string,
        @CurrentUser() user: User,
    ) {
        return this.familiesService.leaveFamily(id, user.id);
    }

    @Get(':id/statistics')
    @ApiOperation({ summary: 'Get family statistics' })
    getFamilyStatistics(
        @Param('id') id: string,
        @CurrentUser() user: User,
    ) {
        return this.familiesService.getFamilyStatistics(id, user.id);
    }
}
