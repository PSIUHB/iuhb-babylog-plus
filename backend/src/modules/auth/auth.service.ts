import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/modules/users/users.service';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { User } from '@/modules/users/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    async validateUser(email: string, password: string): Promise<User | null> {
        const user = await this.usersService.findByEmail(email);
        if (user && await user.validatePassword(password)) {
            return user;
        }
        return null;
    }

    async login(user: User) {
        const payload = {
            sub: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
        };

        // Update last login
        await this.usersService.updateLastLogin(user.id);

        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                avatarUrl: user.avatarUrl,
            },
            accessToken: this.jwtService.sign(payload),
        };
    }

    async register(createUserDto: CreateUserDto) {
        // Check if user with this email already exists
        const existingUser = await this.usersService.findByEmail(createUserDto.email);
        if (existingUser) {
            throw new UnauthorizedException('Email already in use');
        }

        const user = await this.usersService.create(createUserDto);
        return this.login(user);
    }
}
