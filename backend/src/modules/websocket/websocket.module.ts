import { Module, Global, forwardRef } from '@nestjs/common';
import { WebSocketGateway } from './websocket.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { FamiliesModule } from '@/modules/families/families.module';

@Global()
@Module({
    imports: [
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET'),
                signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') },
            }),
        }),
        forwardRef(() => FamiliesModule),
    ],
    providers: [WebSocketGateway],
    exports: [WebSocketGateway],
})
export class WebSocketModule {}