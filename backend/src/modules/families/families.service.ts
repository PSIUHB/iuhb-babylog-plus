import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Family } from './entities/family.entity';
import { UserFamily } from './entities/user-family.entity';
import { Invitation } from './entities/invitation.entity';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { User } from '@/modules/users/entities/user.entity';
import { randomBytes } from 'crypto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FamilyRole } from '@/interfaces';
import { EventsService } from '@/modules/events/events.service';

@Injectable()
export class FamiliesService {
    constructor(
        @InjectRepository(Family)
        private familyRepository: Repository<Family>,
        @InjectRepository(UserFamily)
        private userFamilyRepository: Repository<UserFamily>,
        @InjectRepository(Invitation)
        private invitationRepository: Repository<Invitation>,
        private eventEmitter: EventEmitter2,
        @Inject(forwardRef(() => EventsService))
        private eventsService: EventsService,
    ) {}

    async create(createFamilyDto: CreateFamilyDto, user: User): Promise<Family> {
        const inviteCode = this.generateInviteCode();

        const family = this.familyRepository.create({
            ...createFamilyDto,
            inviteCode,
        });

        const savedFamily = await this.familyRepository.save(family);

        // Add creator as admin
        await this.userFamilyRepository.save({
            userId: user.id,
            familyId: savedFamily.id,
            role: 'parent' as any,
            isPrimary: true,
        });

        return savedFamily;
    }

    async findAll(userId: string): Promise<Family[]> {
        const userFamilies = await this.userFamilyRepository.find({
            where: { userId, leftAt: undefined },
            relations: ['family'],
        });

        return userFamilies.map(uf => uf.family);
    }

    async findOne(id: string, userId: string): Promise<Family> {
        const family = await this.familyRepository.findOne({
            where: { id },
            relations: ['userFamilies', 'userFamilies.user', 'children'],
        });

        if (!family) {
            throw new NotFoundException('Family not found');
        }

        // Check if user belongs to family
        const userFamily = family.userFamilies.find(uf => uf.userId === userId);
        if (!userFamily) {
            throw new ForbiddenException('Access denied');
        }

        return family;
    }

    async update(id: string, updateFamilyDto: UpdateFamilyDto, userId: string): Promise<Family> {
        const family = await this.findOne(id, userId);

        // Check if user is admin
        const userFamily = await this.getUserFamilyRole(userId, id);
        if (userFamily?.role !== 'parent') {
            throw new ForbiddenException('Only admins can update family');
        }

        Object.assign(family, updateFamilyDto);
        return this.familyRepository.save(family);
    }

    async inviteMember(familyId: string, inviteMemberDto: InviteMemberDto, userId: string): Promise<Invitation> {
        // Check if user is admin or parent
        const userFamily = await this.getUserFamilyRole(userId, familyId);
        if (!userFamily || userFamily.role !== 'parent') {
            throw new ForbiddenException('Insufficient permissions');
        }

        // Check if user is already in family
        const existingMember = await this.userFamilyRepository.findOne({
            where: { familyId, user: { email: inviteMemberDto.email } },
        });

        if (existingMember) {
            throw new BadRequestException('User is already a family member');
        }

        // Check for existing invitation
        const existingInvitation = await this.invitationRepository.findOne({
            where: { 
                family: { id: familyId }, 
                email: inviteMemberDto.email, 
                acceptedAt: IsNull(),
                accepted: false 
            },
        });

        if (existingInvitation) {
            throw new BadRequestException('Invitation already sent');
        }

        const token = randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        const invitation = this.invitationRepository.create({
            family: { id: familyId },
            email: inviteMemberDto.email,
            role: inviteMemberDto.role,
            message: inviteMemberDto.message,
            invitedBy: { id: userId },
            token,
            expiresAt,
        });

        const savedInvitation = await this.invitationRepository.save(invitation);

        this.eventEmitter.emit('invitation.created', savedInvitation);

        return savedInvitation;
    }

    async joinFamily(code: string, userId: string): Promise<Family> {
        // First try to find a family with this invite code
        const family = await this.familyRepository.findOne({
            where: { inviteCode: code },
        });

        if (family) {
            // This is an invite code
            // Check if already member
            const existingMember = await this.userFamilyRepository.findOne({
                where: { familyId: family.id, userId },
            });

            if (existingMember) {
                throw new BadRequestException('Already a member of this family');
            }

            // Add user to family
            await this.userFamilyRepository.save({
                userId,
                familyId: family.id,
                role: FamilyRole.CAREGIVER,
                isPrimary: false,
            });

            return family;
        }

        // If not found as invite code, try as an invitation token
        const invitation = await this.invitationRepository.findOne({
            where: { token: code },
            relations: ['family'],
        });

        if (!invitation) {
            throw new NotFoundException('Invalid invite code or invitation token');
        }

        if (invitation.acceptedAt) {
            throw new BadRequestException('Invitation already accepted');
        }

        if (invitation.expiresAt < new Date()) {
            throw new BadRequestException('Invitation expired');
        }

        // Add user to family
        let role: FamilyRole = FamilyRole.CAREGIVER;
        if (invitation.role && Object.values(FamilyRole).includes(invitation.role as FamilyRole)) {
            role = invitation.role as FamilyRole;
        }

        await this.userFamilyRepository.save({
            userId: userId,
            familyId: invitation.family.id,
            role,
            isPrimary: false,
        });

        // Mark invitation as accepted
        invitation.acceptedAt = new Date();
        invitation.accepted = true;
        await this.invitationRepository.save(invitation);

        return invitation.family;
    }

    async leaveFamily(familyId: string, userId: string): Promise<void> {
        const userFamily = await this.userFamilyRepository.findOne({
            where: { familyId, userId },
        });

        if (!userFamily) {
            throw new NotFoundException('Not a member of this family');
        }

        // Check if user is the only parent
        if (userFamily.role === FamilyRole.PARENT) {
            const parentCount = await this.userFamilyRepository.count({
                where: { familyId, role: FamilyRole.PARENT, leftAt: undefined },
            });

            if (parentCount === 1) {
                throw new BadRequestException('Cannot leave family as the only parent');
            }
        }

        userFamily.leftAt = new Date();
        await this.userFamilyRepository.save(userFamily);
    }

    async getUserFamilyRole(userId: string, familyId: string): Promise<UserFamily | null> {
        return this.userFamilyRepository.findOne({
            where: { userId, familyId, leftAt: undefined },
        });
    }

    async getUserFamilies(userId: string): Promise<UserFamily[]> {
        return this.userFamilyRepository.find({
            where: { userId, leftAt: undefined },
            relations: ['family'],
        });
    }

    async getPendingInvitations(userEmail: string) {
        console.log('Fetching invitations for user email:', userEmail);

        // Find invitations by email that haven't been accepted yet
        const pendingInvitations = await this.invitationRepository.find({
            where: [
                { email: userEmail, acceptedAt: undefined },
                { email: userEmail, accepted: false }
            ],
            relations: ['family', 'invitedBy']
        });

        console.log('Found pending invitations:', pendingInvitations.length);
        return pendingInvitations;
    }

    async getInvitationById(invitationId: string, userEmail: string) {
        // Find the invitation by ID
        const invitation = await this.invitationRepository.findOne({
            where: { id: invitationId },
            relations: ['family', 'invitedBy']
        });

        if (!invitation) {
            throw new NotFoundException('Invitation not found');
        }

        // Check if the invitation is for the current user
        if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
            throw new ForbiddenException('You do not have permission to view this invitation');
        }

        return invitation;
    }

    async updateInvitationsConsistency() {
        try {
            // Get all invitations
            const allInvitations = await this.invitationRepository.find();
            console.log(`Found ${allInvitations.length} total invitations`);

            let updatedCount = 0;

            for (const invitation of allInvitations) {
                let needsUpdate = false;

                // If accepted is false but acceptedAt is not null, set acceptedAt to null
                if (invitation.accepted === false && invitation.acceptedAt !== null) {
                    invitation.acceptedAt = null;
                    needsUpdate = true;
                }

                // If accepted is true but acceptedAt is null, set accepted to false
                if (invitation.accepted === true && invitation.acceptedAt === null) {
                    invitation.accepted = false;
                    needsUpdate = true;
                }

                // If acceptedAt is not null, ensure accepted is true
                if (invitation.acceptedAt !== null && invitation.accepted !== true) {
                    invitation.accepted = true;
                    needsUpdate = true;
                }

                if (needsUpdate) {
                    await this.invitationRepository.save(invitation);
                    updatedCount++;
                }
            }

            console.log(`Updated ${updatedCount} invitations for consistency`);
        } catch (error) {
            console.error('Error updating invitations:', error);
        }
    }

    private generateInviteCode(): string {
        return randomBytes(4).toString('hex').toUpperCase();
    }

    /**
     * Get family statistics
     */
    async getFamilyStatistics(familyId: string, userId: string): Promise<any> {
        // Check if user has access to this family
        const userFamily = await this.userFamilyRepository.findOne({
            where: { userId, familyId },
        });

        if (!userFamily) {
            throw new ForbiddenException('You do not have access to this family');
        }

        // Get the family
        const family = await this.familyRepository.findOne({
            where: { id: familyId },
            relations: ['userFamilies', 'userFamilies.user', 'children'],
        });

        if (!family) {
            throw new NotFoundException('Family not found');
        }

        // Count active caregivers (users who haven't left the family)
        const activeCaregivers = family.userFamilies.filter(
            (uf) => uf.leftAt === undefined
        ).length;

        // Get the oldest child's birth date to calculate days since birth
        let oldestChildBirthDate = new Date();
        let childrenAge = '';
        
        if (family.children && family.children.length > 0) {
            const sortedChildren = [...family.children].sort(
                (a, b) => new Date(a.birthDate).getTime() - new Date(b.birthDate).getTime()
            );
            
            const oldestChild = sortedChildren[0];
            oldestChildBirthDate = new Date(oldestChild.birthDate);
            
            // Format the birth date for display
            childrenAge = oldestChildBirthDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            });
        }

        // Calculate days since birth
        const today = new Date();
        const daysSinceBirth = Math.floor(
            (today.getTime() - oldestChildBirthDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Get events for the family in the last 7 days
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        
        const last24Hours = new Date();
        last24Hours.setHours(last24Hours.getHours() - 24);

        // Get all events for the family
        const user = { id: userId } as User; // Create a minimal User object for the eventsService
        const allEvents = await this.eventsService.findByFamily(familyId, user);
        
        // Get events from the last 7 days
        const recentEvents = allEvents.filter(event => 
            new Date(event.occurredAt) >= last7Days
        );
        
        // Get events from the last 24 hours
        const todayEvents = allEvents.filter(event => 
            new Date(event.occurredAt) >= last24Hours
        );

        // Calculate total events
        const totalEvents = allEvents.length;

        // Find most active caregiver in the last 24 hours
        const caregiverCounts = {};
        todayEvents.forEach(event => {
            const caregiverId = event.createdByUserId;
            caregiverCounts[caregiverId] = (caregiverCounts[caregiverId] || 0) + 1;
        });

        let mostActiveCaregiver = {
            name: 'No activity',
            avatar: 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp',
            eventsToday: 0
        };

        if (Object.keys(caregiverCounts).length > 0) {
            const mostActiveCaregiverId = Object.keys(caregiverCounts).reduce((a, b) => 
                caregiverCounts[a] > caregiverCounts[b] ? a : b
            );
            
            const caregiver = family.userFamilies.find(uf => 
                uf.userId === mostActiveCaregiverId
            )?.user;

            if (caregiver) {
                mostActiveCaregiver = {
                    name: `${caregiver.firstName} ${caregiver.lastName}`,
                    avatar: caregiver.avatarUrl || 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp',
                    eventsToday: caregiverCounts[mostActiveCaregiverId]
                };
            }
        }

        // Calculate weekly stats
        const weeklyStats = {
            feedings: recentEvents.filter(event => event.type === 'feeding').length,
            sleepHours: Math.round(recentEvents.filter(event => event.type === 'sleep')
                .reduce((total, event) => {
                    // Calculate sleep duration in hours if available
                    if (event.data && event.data.duration_minutes) {
                        return total + (event.data.duration_minutes / 60);
                    }
                    return total;
                }, 0)),
            diaperChanges: recentEvents.filter(event => event.type === 'diaper').length,
            milestones: recentEvents.filter(event => event.type === 'activity' && 
                event.data && event.data.is_milestone).length
        };

        // Get recent milestones
        const milestoneEvents = allEvents
            .filter(event => event.type === 'activity' && event.data && event.data.is_milestone)
            .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
            .slice(0, 3); // Get top 3 most recent

        const recentMilestones = milestoneEvents.map(event => {
            const daysSince = Math.floor(
                (today.getTime() - new Date(event.occurredAt).getTime()) / (1000 * 60 * 60 * 24)
            );
            
            let dateText;
            if (daysSince === 0) {
                dateText = 'Today';
            } else if (daysSince === 1) {
                dateText = 'Yesterday';
            } else if (daysSince < 7) {
                dateText = `${daysSince} days ago`;
            } else if (daysSince < 30) {
                const weeks = Math.floor(daysSince / 7);
                dateText = `${weeks} week${weeks > 1 ? 's' : ''} ago`;
            } else {
                dateText = new Date(event.occurredAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                });
            }

            return {
                id: event.id,
                icon: event.data.icon || '🎯',
                title: event.data.title || 'Milestone',
                child: event.child ? event.child.firstName : 'Child',
                date: dateText
            };
        });

        // Return real data combined with some mock data where real data isn't available yet
        return {
            totalCaregivers: family.userFamilies.length,
            activeCaregivers,
            totalChildren: family.children ? family.children.length : 0,
            childrenAge,
            daysSinceBirth,
            totalEvents,
            mostActiveCaregiver,
            weeklyStats,
            recentMilestones: recentMilestones.length > 0 ? recentMilestones : [
                {
                    id: 1,
                    icon: '😊',
                    title: 'First Social Smile',
                    child: 'Anna',
                    date: '2 days ago'
                },
                {
                    id: 2,
                    icon: '👀',
                    title: 'Eye Contact',
                    child: 'Ben',
                    date: '5 days ago'
                },
                {
                    id: 3,
                    icon: '🎵',
                    title: 'Responds to Music',
                    child: 'Anna',
                    date: '1 week ago'
                }
            ]
        };
    }

    async updateFamilyMember(
        familyId: string,
        memberId: string,
        updateData: { role: string },
        requestingUserId: string
    ): Promise<UserFamily> {
        // Check if requesting user has permission (must be parent)
        const requestingUserFamily = await this.getUserFamilyRole(requestingUserId, familyId);
        if (!requestingUserFamily || requestingUserFamily.role !== 'parent') {
            throw new ForbiddenException('Only parents can update family members');
        }

        // Find the member to update
        const memberToUpdate = await this.userFamilyRepository.findOne({
            where: { userId: memberId, familyId, leftAt: undefined }
        });

        if (!memberToUpdate) {
            throw new NotFoundException('Family member not found');
        }

        // Don't allow changing role of primary parent
        if (memberToUpdate.isPrimary && memberToUpdate.role === 'parent' && updateData.role !== 'parent') {
            throw new BadRequestException('Cannot change role of primary parent');
        }

        // Validate the role
        if (updateData.role !== 'parent' && updateData.role !== 'caregiver') {
            throw new BadRequestException('Invalid role. Must be "parent" or "caregiver"');
        }

        // Check if changing the last parent to a caregiver
        if (memberToUpdate.role === 'parent' && updateData.role === 'caregiver') {
            const parentCount = await this.userFamilyRepository.count({
                where: {
                    familyId,
                    role: 'parent' as any,
                    leftAt: undefined
                },
            });

            if (parentCount <= 1) {
                throw new BadRequestException('Cannot change the last parent to a caregiver');
            }
        }

        // Update the member's role
        memberToUpdate.role = updateData.role as FamilyRole;
        return this.userFamilyRepository.save(memberToUpdate);
    }

    async removeFamilyMember(
        familyId: string,
        memberId: string,
        requestingUserId: string
    ): Promise<void> {
        // Check if requesting user has permission (must be parent)
        const requestingUserFamily = await this.getUserFamilyRole(requestingUserId, familyId);
        if (!requestingUserFamily || requestingUserFamily.role !== 'parent') {
            throw new ForbiddenException('Only parents can remove family members');
        }

        // Find the member to remove
        const memberToRemove = await this.userFamilyRepository.findOne({
            where: { userId: memberId, familyId, leftAt: undefined }
        });

        if (!memberToRemove) {
            throw new NotFoundException('Family member not found');
        }

        // Don't allow removing primary parent
        if (memberToRemove.isPrimary && memberToRemove.role === 'parent') {
            throw new BadRequestException('Cannot remove primary parent from family');
        }

        // Don't allow removing yourself
        if (memberId === requestingUserId) {
            throw new BadRequestException('Use leave family endpoint to remove yourself');
        }

        // Check if removing the last parent
        if (memberToRemove.role === 'parent') {
            const parentCount = await this.userFamilyRepository.count({
                where: {
                    familyId,
                    role: 'parent' as any,
                    leftAt: undefined
                },
            });

            if (parentCount <= 1) {
                throw new BadRequestException('Cannot remove the last parent from family');
            }
        }

        // Mark as left
        memberToRemove.leftAt = new Date();
        await this.userFamilyRepository.save(memberToRemove);
    }
}
