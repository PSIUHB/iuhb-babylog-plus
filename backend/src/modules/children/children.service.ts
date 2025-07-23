import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Child } from './entities/child.entity';
import { UserChild, ChildPermission } from './entities/user-child.entity';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';
import { User } from '@/modules/users/entities/user.entity';
import { FamiliesService } from '@/modules/families/families.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventsService } from '@/modules/events/events.service';
import { EventType } from '@/interfaces/event.interface';
import { SleepsService } from '@/modules/trackables/services/sleeps.service';
import { SleepStatus } from '@/modules/trackables/entities/sleep.entity';

@Injectable()
export class ChildrenService {
    constructor(
        @InjectRepository(Child)
        private childRepository: Repository<Child>,
        @InjectRepository(UserChild)
        private userChildRepository: Repository<UserChild>,
        @Inject(forwardRef(() => FamiliesService))
        private familiesService: FamiliesService,
        private eventEmitter: EventEmitter2,
        @Inject(forwardRef(() => EventsService))
        private eventsService: EventsService,
        @Inject(forwardRef(() => SleepsService))
        private sleepsService: SleepsService,
    ) {}

    async create(createChildDto: CreateChildDto, user: User, familyId: string): Promise<Child> {
        // Log the incoming DTO for debugging
        console.log('CreateChildDto received:', JSON.stringify(createChildDto, null, 2));
        
        // Check if user has permission in family
        const userFamily = await this.familiesService.getUserFamilyRole(user.id, familyId);
        if (!userFamily || !['admin', 'parent'].includes(userFamily.role)) {
            throw new ForbiddenException('Insufficient permissions to add child');
        }

        // Create an entity-compatible object
        const entityData: Partial<Child> = {
            familyId
        };
        
        // Process name field if provided
        if (createChildDto.name && (!createChildDto.firstName && !createChildDto.lastName)) {
            const nameParts = createChildDto.name.trim().split(/\s+/);
            if (nameParts.length > 1) {
                entityData.firstName = nameParts[0];
                entityData.lastName = nameParts.slice(1).join(' ');
            } else {
                entityData.firstName = createChildDto.name;
                entityData.lastName = '';
            }
        } else {
            // Copy firstName and lastName if provided
            entityData.firstName = createChildDto.firstName || '';
            entityData.lastName = createChildDto.lastName || '';
        }
        
        // Copy direct entity fields
        entityData.birthDate = createChildDto.birthDate;
        entityData.gender = createChildDto.gender;
        if (createChildDto.notes) entityData.notes = createChildDto.notes;
        
        // Handle numeric fields - ensure they're not null or undefined and are valid numbers
        if (createChildDto.birthWeightKg !== undefined && createChildDto.birthWeightKg !== null) {
            const weightValue = Number(createChildDto.birthWeightKg);
            if (!isNaN(weightValue)) {
                entityData.birthWeightKg = weightValue;
                console.log('Setting birthWeightKg to:', weightValue);
            }
        }
        
        if (createChildDto.birthHeightCm !== undefined && createChildDto.birthHeightCm !== null) {
            const heightValue = Number(createChildDto.birthHeightCm);
            if (!isNaN(heightValue)) {
                entityData.birthHeightCm = heightValue;
                console.log('Setting birthHeightCm to:', heightValue);
            }
        }
        
        
        // Handle isActive to status mapping
        if (createChildDto.isActive !== undefined) {
            entityData.status = createChildDto.isActive ? 'active' : 'inactive';
        } else if (createChildDto.status) {
            entityData.status = createChildDto.status;
        } else {
            entityData.status = 'active';
        }
        
        // Log the entity data before creating the entity
        console.log('Entity data before create:', JSON.stringify(entityData, null, 2));
        
        const child = this.childRepository.create(entityData);
        console.log('Child entity before save:', JSON.stringify(child, null, 2));
        
        const savedChild = await this.childRepository.save(child);
        console.log('Saved child entity:', JSON.stringify(savedChild, null, 2));

        // Create user-child relationship
        await this.userChildRepository.save({
            userId: user.id,
            childId: savedChild.id,
            permission: ChildPermission.WRITE,
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
            where: { familyId, status: 'active' },
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
        // Log the incoming DTO for debugging with timestamp
        console.log(`[${new Date().toISOString()}] UPDATE OPERATION STARTED for child ID: ${id}`);
        console.log('UpdateChildDto received:', JSON.stringify(updateChildDto, null, 2));
        console.log('birthWeightKg in DTO:', updateChildDto.birthWeightKg);
        console.log('birthHeightCm in DTO:', updateChildDto.birthHeightCm);
        console.log('birthWeightKg property exists in DTO:', 'birthWeightKg' in updateChildDto);
        console.log('birthHeightCm property exists in DTO:', 'birthHeightCm' in updateChildDto);
        
        const child = await this.findOne(id, user);
        console.log('Existing child entity:', JSON.stringify(child, null, 2));
        console.log('Existing birthWeightKg:', child.birthWeightKg);
        console.log('Existing birthHeightCm:', child.birthHeightCm);

        // Check if user has permission in family
        const userFamily = await this.familiesService.getUserFamilyRole(user.id, child.familyId);
        const hasRolePermission = userFamily && ['admin', 'parent'].includes(userFamily.role);
        
        // Check direct write permission
        const userChild = await this.userChildRepository.findOne({
            where: { userId: user.id, childId: id },
        });
        const hasDirectPermission = userChild && userChild.permission === ChildPermission.WRITE;
        
        // Allow update if user has either role permission or direct permission
        if (!hasRolePermission && !hasDirectPermission) {
            throw new ForbiddenException('Insufficient permissions to update child');
        }
        
        // Create an entity-compatible update object
        const entityUpdate: Partial<Child> = {};
        console.log('Initial entityUpdate (empty):', JSON.stringify(entityUpdate, null, 2));
        
        // Process name field if provided
        if (updateChildDto.name && (!updateChildDto.firstName && !updateChildDto.lastName)) {
            const nameParts = updateChildDto.name.trim().split(/\s+/);
            if (nameParts.length > 1) {
                entityUpdate.firstName = nameParts[0];
                entityUpdate.lastName = nameParts.slice(1).join(' ');
            } else {
                entityUpdate.firstName = updateChildDto.name;
                entityUpdate.lastName = '';
            }
        } else {
            // Copy firstName and lastName if provided
            if (updateChildDto.firstName) entityUpdate.firstName = updateChildDto.firstName;
            if (updateChildDto.lastName) entityUpdate.lastName = updateChildDto.lastName;
        }
        
        // Copy direct entity fields
        if (updateChildDto.birthDate) entityUpdate.birthDate = updateChildDto.birthDate;
        if (updateChildDto.gender) entityUpdate.gender = updateChildDto.gender;
        if (updateChildDto.notes) entityUpdate.notes = updateChildDto.notes;
        if (updateChildDto.avatarUrl) entityUpdate.avatarUrl = updateChildDto.avatarUrl;
        
        console.log('entityUpdate after basic fields:', JSON.stringify(entityUpdate, null, 2));
        
        // Handle numeric fields - ensure they're not null or undefined and are valid numbers
        // Always include these fields in the update, even if they're not in the DTO
        // This ensures they're explicitly updated in the database
        console.log('Processing birthWeightKg field...');
        if (updateChildDto.birthWeightKg !== undefined && updateChildDto.birthWeightKg !== null) {
            const weightValue = Number(updateChildDto.birthWeightKg);
            console.log('birthWeightKg value from DTO:', updateChildDto.birthWeightKg);
            console.log('birthWeightKg converted to number:', weightValue);
            console.log('Is valid number?', !isNaN(weightValue));
            
            if (!isNaN(weightValue)) {
                entityUpdate.birthWeightKg = weightValue;
                console.log('Setting birthWeightKg to:', weightValue);
            } else {
                console.log('Not setting birthWeightKg because value is not a valid number');
            }
        } else if ('birthWeightKg' in updateChildDto) {
            // If the field is explicitly set to null in the DTO
            entityUpdate.birthWeightKg = undefined;
            console.log('Setting birthWeightKg to undefined (explicitly included in DTO)');
        } else {
            console.log('birthWeightKg not included in update (not in DTO)');
        }
        
        console.log('Processing birthHeightCm field...');
        if (updateChildDto.birthHeightCm !== undefined && updateChildDto.birthHeightCm !== null) {
            const heightValue = Number(updateChildDto.birthHeightCm);
            console.log('birthHeightCm value from DTO:', updateChildDto.birthHeightCm);
            console.log('birthHeightCm converted to number:', heightValue);
            console.log('Is valid number?', !isNaN(heightValue));
            
            if (!isNaN(heightValue)) {
                entityUpdate.birthHeightCm = heightValue;
                console.log('Setting birthHeightCm to:', heightValue);
            } else {
                console.log('Not setting birthHeightCm because value is not a valid number');
            }
        } else if ('birthHeightCm' in updateChildDto) {
            // If the field is explicitly set to null in the DTO
            entityUpdate.birthHeightCm = undefined;
            console.log('Setting birthHeightCm to undefined (explicitly included in DTO)');
        } else {
            console.log('birthHeightCm not included in update (not in DTO)');
        }
        
        // Handle isActive to status mapping
        if (updateChildDto.isActive !== undefined) {
            entityUpdate.status = updateChildDto.isActive ? 'active' : 'inactive';
        } else if (updateChildDto.status) {
            entityUpdate.status = updateChildDto.status;
        }

        // Log the entity update before applying it
        console.log('Entity update before applying:', JSON.stringify(entityUpdate, null, 2));
        console.log('birthWeightKg in entityUpdate:', entityUpdate.birthWeightKg);
        console.log('birthHeightCm in entityUpdate:', entityUpdate.birthHeightCm);
        
        // Check if these fields exist in the entityUpdate object
        console.log('birthWeightKg property exists in entityUpdate:', 'birthWeightKg' in entityUpdate);
        console.log('birthHeightCm property exists in entityUpdate:', 'birthHeightCm' in entityUpdate);
        
        // Apply the update using Object.assign for most fields
        Object.assign(child, entityUpdate);
        console.log('Child entity after Object.assign:', JSON.stringify(child, null, 2));
        console.log('birthWeightKg in child after Object.assign:', child.birthWeightKg);
        console.log('birthHeightCm in child after Object.assign:', child.birthHeightCm);
        
        // Explicitly set birthWeightKg and birthHeightCm fields if they exist in the entityUpdate
        // This ensures they're always included in the SQL UPDATE statement
        if ('birthWeightKg' in entityUpdate) {
            console.log('Explicitly setting birthWeightKg to:', entityUpdate.birthWeightKg);
            // Use type assertion to handle null values
            child.birthWeightKg = entityUpdate.birthWeightKg !== undefined ? entityUpdate.birthWeightKg : (null as unknown as number);
        }
        
        if ('birthHeightCm' in entityUpdate) {
            console.log('Explicitly setting birthHeightCm to:', entityUpdate.birthHeightCm);
            // Use type assertion to handle null values
            child.birthHeightCm = entityUpdate.birthHeightCm !== undefined ? entityUpdate.birthHeightCm : (null as unknown as number);
        }
        
        console.log('Child entity after explicit field setting:', JSON.stringify(child, null, 2));
        console.log('birthWeightKg in child after explicit setting:', child.birthWeightKg);
        console.log('birthHeightCm in child after explicit setting:', child.birthHeightCm);
        
        // Use a direct query to update these fields to ensure they're included in the update
        // This is a more direct approach that bypasses any TypeORM optimizations
        if ('birthWeightKg' in entityUpdate || 'birthHeightCm' in entityUpdate) {
            console.log('Using direct query to update birthWeightKg and birthHeightCm fields');
            
            // Build the update query
            const updateQuery = this.childRepository.createQueryBuilder()
                .update(Child)
                .where("id = :id", { id });
                
            if ('birthWeightKg' in entityUpdate) {
                updateQuery.set({ birthWeightKg: entityUpdate.birthWeightKg });
            }
            
            if ('birthHeightCm' in entityUpdate) {
                updateQuery.set({ birthHeightCm: entityUpdate.birthHeightCm });
            }
            
            // Execute the update query
            await updateQuery.execute();
            console.log('Direct update query executed');
        }
        
        // Save the updated child
        console.log('Saving child to database...');
        const updatedChild = await this.childRepository.save(child);
        console.log('Updated child entity after save:', JSON.stringify(updatedChild, null, 2));
        console.log('birthWeightKg in updatedChild after save:', updatedChild.birthWeightKg);
        console.log('birthHeightCm in updatedChild after save:', updatedChild.birthHeightCm);
        
        // Fetch the child again to verify the update
        console.log('Fetching child from database to verify update...');
        const verifiedChild = await this.childRepository.findOne({ where: { id } });
        console.log('Verified child entity:', JSON.stringify(verifiedChild, null, 2));
        
        // Add null check before accessing properties
        if (verifiedChild) {
            console.log('birthWeightKg in verifiedChild:', verifiedChild.birthWeightKg);
            console.log('birthHeightCm in verifiedChild:', verifiedChild.birthHeightCm);
        } else {
            console.log('Warning: Could not verify child after update (not found)');
        }
        
        console.log(`[${new Date().toISOString()}] UPDATE OPERATION COMPLETED for child ID: ${id}`);

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
        const updatedChild = await this.childRepository.save(child);
        
        // Emit event for avatar update
        this.eventEmitter.emit('child.updated', {
            child: updatedChild,
            familyId: child.familyId,
            userId: user.id,
        });
        
        return updatedChild;
    }

    private async checkUserPermission(userId: string, child: Child): Promise<void> {
        const userFamily = await this.familiesService.getUserFamilyRole(userId, child.familyId);
        if (!userFamily) {
            throw new ForbiddenException('Access denied');
        }
    }

    /**
     * Get the latest weight and height measurements for a child from events
     */
    private async getLatestMeasurements(childId: string, user: User): Promise<{ currentWeightKg?: number, currentHeightCm?: number }> {
        const measurements: { currentWeightKg?: number, currentHeightCm?: number } = {
            currentWeightKg: undefined,
            currentHeightCm: undefined
        };

        // Get the latest weight event
        const weightEvents = await this.eventsService.findByChild(childId, user, {
            type: EventType.WEIGHT,
            limit: 1
        });

        if (weightEvents.length > 0) {
            const latestWeight = weightEvents[0];
            if (latestWeight.data.unit === 'kg') {
                measurements.currentWeightKg = latestWeight.data.value;
            } else if (latestWeight.data.unit === 'lb') {
                // Convert pounds to kilograms
                measurements.currentWeightKg = latestWeight.data.value * 0.45359237;
            }
        }

        // Get the latest height event
        const heightEvents = await this.eventsService.findByChild(childId, user, {
            type: EventType.HEIGHT,
            limit: 1
        });

        if (heightEvents.length > 0) {
            const latestHeight = heightEvents[0];
            if (latestHeight.data.unit === 'cm') {
                measurements.currentHeightCm = latestHeight.data.value;
            } else if (latestHeight.data.unit === 'in') {
                // Convert inches to centimeters
                measurements.currentHeightCm = latestHeight.data.value * 2.54;
            }
        }

        return measurements;
    }

    async getChildStatus(id: string, user: User): Promise<{ status: string }> {
        // Validate access
        await this.findOne(id, user);

        // Get all sleep records for the child
        const sleepRecords = await this.sleepsService.findAll(id, user);

        // If there are no sleep records, the child is awake
        if (!sleepRecords || sleepRecords.length === 0) {
            return { status: 'awake' };
        }

        // Sort sleep records by occurredAt in descending order (most recent first)
        const sortedSleepRecords = [...sleepRecords].sort((a, b) => 
            new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
        );

        // Get the most recent sleep record
        const latestSleepRecord = sortedSleepRecords[0];

        // If the most recent sleep record has status START, the child is sleeping
        if (latestSleepRecord.status === SleepStatus.START) {
            return { status: 'sleeping' };
        }

        // Otherwise, the child is awake
        return { status: 'awake' };
    }

    async getChildStatistics(id: string, user: User): Promise<any> {
        // Validate access
        const child = await this.findOne(id, user);

        // Get statistics from events service
        const eventStats = await this.eventsService.getStatistics(id, user);

        // Get latest weight and height measurements
        const { currentWeightKg, currentHeightCm } = await this.getLatestMeasurements(id, user);

        // Calculate age in days, months, and years
        const birthDate = new Date(child.birthDate);
        const today = new Date();
        const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
        const ageInMonths = Math.floor(ageInDays / 30.44); // Average days in a month
        const ageInYears = Math.floor(ageInDays / 365.25); // Account for leap years

        // Format age for display
        let ageDisplay = '';
        if (ageInYears > 0) {
            ageDisplay = `${ageInYears} year${ageInYears !== 1 ? 's' : ''}`;
            if (ageInMonths % 12 > 0) {
                ageDisplay += ` ${ageInMonths % 12} month${ageInMonths % 12 !== 1 ? 's' : ''}`;
            }
        } else if (ageInMonths > 0) {
            ageDisplay = `${ageInMonths} month${ageInMonths !== 1 ? 's' : ''}`;
        } else {
            ageDisplay = `${ageInDays} day${ageInDays !== 1 ? 's' : ''}`;
        }

        // Return combined statistics
        return {
            child: {
                id: child.id,
                name: child.firstName,
                birthDate: child.birthDate,
                ageInDays,
                ageInMonths,
                ageInYears,
                ageDisplay,
                gender: child.gender,
                avatarUrl: child.avatarUrl,
                birthWeightKg: child.birthWeightKg,
                birthHeightCm: child.birthHeightCm,
                currentWeightKg,
                currentHeightCm,
            },
            events: eventStats,
            // Add more statistics as needed
        };
    }
}