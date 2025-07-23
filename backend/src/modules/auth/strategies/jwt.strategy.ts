import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@/modules/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private usersService: UsersService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET') || 'default_secret',
        });
    }

    async validate(payload: any) {
        // Check if avatarUrl is in the payload
        if (payload.avatarUrl !== undefined) {
            // Return user data from the payload
            return {
                id: payload.sub,
                email: payload.email,
                firstName: payload.firstName,
                lastName: payload.lastName,
                avatarUrl: payload.avatarUrl
            };
        } else {
            // For tokens issued before the update, fetch the user from the database
            // to get the avatarUrl
            const user = await this.usersService.findOne(payload.sub);
            
            return {
                id: payload.sub,
                email: payload.email,
                firstName: payload.firstName,
                lastName: payload.lastName,
                avatarUrl: user?.avatarUrl || null
            };
        }
    }
}