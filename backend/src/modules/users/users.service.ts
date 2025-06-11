import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
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
}
