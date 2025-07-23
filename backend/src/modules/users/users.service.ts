import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    async updateLastLogin(userId: string | number): Promise<void> {
        await this.userRepository.update(userId, { lastLoginAt: new Date() });
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const user = this.userRepository.create({
            ...createUserDto,
            passwordHash: createUserDto.password,
        });
        return this.userRepository.save(user);
    }

    async findOne(userId: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { id: userId } });
    }

    async update(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
        // Validate input
        if (Object.keys(updateUserDto).length === 0) {
            throw new BadRequestException('No update data provided');
        }

        // Find the user
        const user = await this.findOne(userId);
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        // Check email uniqueness if email is being updated
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.findByEmail(updateUserDto.email);
            if (existingUser && existingUser.id !== userId) {
                throw new ConflictException(`Email ${updateUserDto.email} is already in use`);
            }
        }

        // Validate timezone if provided
        if (updateUserDto.timezone) {
            try {
                // Simple validation - check if timezone is valid by trying to use it
                Intl.DateTimeFormat(undefined, { timeZone: updateUserDto.timezone });
            } catch (error) {
                throw new BadRequestException(`Invalid timezone: ${updateUserDto.timezone}`);
            }
        }

        // Validate locale if provided
        if (updateUserDto.locale) {
            try {
                // Simple validation - check if locale is valid by trying to use it
                new Intl.DisplayNames([updateUserDto.locale], { type: 'language' });
            } catch (error) {
                throw new BadRequestException(`Invalid locale: ${updateUserDto.locale}`);
            }
        }

        // Use direct update method instead of save to ensure changes are persisted
        await this.userRepository.update(userId, updateUserDto);
        
        // Fetch and return the updated user
        const updatedUser = await this.findOne(userId);
        if (!updatedUser) {
            throw new NotFoundException(`User with ID ${userId} not found after update`);
        }
        
        return updatedUser;
    }
}
