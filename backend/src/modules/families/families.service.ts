import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Family } from './entities/family.entity';
import { UserFamily } from './entities/user-family.entity';
import { Invitation } from './entities/invitation.entity';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { User } from '@/modules/users/entities/user.entity';
import { randomBytes } from 'crypto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FamilyRole } from './entities/user-family.entity';

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
            role: 'admin' as any,
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
        if (userFamily?.role !== 'admin') {
            throw new ForbiddenException('Only admins can update family');
        }

        Object.assign(family, updateFamilyDto);
        return this.familyRepository.save(family);
    }

    async inviteMember(familyId: string, inviteMemberDto: InviteMemberDto, userId: string): Promise<Invitation> {
        // Check if user is admin or parent
        const userFamily = await this.getUserFamilyRole(userId, familyId);
        if (!userFamily || !['admin', 'parent'].includes(userFamily.role)) {
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
            where: { family: { id: familyId }, email: inviteMemberDto.email, acceptedAt: undefined },
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
            invitedBy: { id: userId },
            token,
            expiresAt,
        });

        const savedInvitation = await this.invitationRepository.save(invitation);

        this.eventEmitter.emit('invitation.created', savedInvitation);

        return savedInvitation;
    }

    async joinFamily(inviteCode: string, userId: string): Promise<Family> {
        const family = await this.familyRepository.findOne({
            where: { inviteCode },
        });

        if (!family) {
            throw new NotFoundException('Invalid invite code');
        }

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

    async acceptInvitation(token: string, userId: string): Promise<Family> {
        const invitation = await this.invitationRepository.findOne({
            where: { token },
            relations: ['family'],
        });

        if (!invitation) {
            throw new NotFoundException('Invalid invitation');
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

        // Check if user is the only admin
        if (userFamily.role === FamilyRole.ADMIN) {
            const adminCount = await this.userFamilyRepository.count({
                where: { familyId, role: FamilyRole.ADMIN, leftAt: undefined },
            });

            if (adminCount === 1) {
                throw new BadRequestException('Cannot leave family as the only admin');
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

    private generateInviteCode(): string {
        return randomBytes(4).toString('hex').toUpperCase();
    }
}