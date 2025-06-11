import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Child } from './entities/child.entity';
import { UserChild, ChildPermission } from './entities/user-child.entity';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';
import { User } from '@/modules/users/entities/user.entity';
import { FamiliesService } from '@/modules/families/families.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ChildrenService {
    constructor(
        @InjectRepository(Child)
        private childRepository: Repository<Child>,
        @InjectRepository(UserChild)
        private userChildRepository: Repository<UserChild>,
        private familiesService: FamiliesService,
        private eventEmitter: EventEmitter2,
    ) {}

    async create(createChildDto: CreateChildDto, user: User, familyId: string): Promise<Child> {
        // Check if user has permission in family
        const userFamily = await this.familiesService.getUserFamilyRole(user.id, familyId);
        if (!userFamily || !['admin', 'parent'].includes(userFamily.role)) {
            throw new ForbiddenException('Insufficient permissions to add child');
        }

        const child = this.childRepository.create({
            ...createChildDto,
            familyId,
            colorHex: createChildDto.colorHex || this.generateRandomColor(),
        });

        const savedChild = await this.childRepository.save(child);

        // Create user-child relationship
        await this.userChildRepository.save({
            userId: user.id,
            childId: savedChild.id,
            permissionLevel: 'full',
        });

        // Emit event for real-time updates
        this.eventEmitter.emit('child.created', {
            child: savedChild,
            familyId,
            userId: user.id,
        });

        return savedChild;
    }

    async findAllByFamily(familyId: string, user: User): Promise<Child[]> {
        // Check if user belongs to family
        const userFamily = await this.familiesService.getUserFamilyRole(user.id, familyId);
        if (!userFamily) {
            throw new ForbiddenException('Access denied');
        }

        return this.childRepository.find({
            where: { familyId, isActive: true },
            order: { birthDate: 'ASC' },
        });
    }

    async findOne(id: string, user: User): Promise<Child> {
        const child = await this.childRepository.findOne({
            where: { id },
            relations: ['family'],
        });

        if (!child) {
            throw new NotFoundException('Child not found');
        }

        // Check permissions
        await this.checkUserPermission(user.id, child);

        return child;
    }

    async update(id: string, updateChildDto: UpdateChildDto, user: User): Promise<Child> {
        const child = await this.findOne(id, user);

        // Check write permission
        const userChild = await this.userChildRepository.findOne({
            where: { userId: user.id, childId: id },
        });

        if (!userChild || userChild.permission === ChildPermission.WRITE) {
            throw new ForbiddenException('Insufficient permissions to update child');
        }

        Object.assign(child, updateChildDto);
        const updatedChild = await this.childRepository.save(child);

        // Emit update event
        this.eventEmitter.emit('child.updated', {
            child: updatedChild,
            familyId: child.familyId,
            userId: user.id,
        });

        return updatedChild;
    }

    async uploadAvatar(id: string, file: Express.Multer.File, user: User): Promise<Child> {
        const child = await this.findOne(id, user);

        child.avatarUrl = `/uploads/avatars/${file.filename}`;
        return this.childRepository.save(child);
    }

    private async checkUserPermission(userId: string, child: Child): Promise<void> {
        const userFamily = await this.familiesService.getUserFamilyRole(userId, child.familyId);
        if (!userFamily) {
            throw new ForbiddenException('Access denied');
        }
    }

    private generateRandomColor(): string {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#B983FF'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}