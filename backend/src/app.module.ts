import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import databaseConfig from '@/config/database.config';
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { FamiliesModule } from '@/modules/families/families.module';
import { ChildrenModule } from '@/modules/children/children.module';
import { EventsModule } from '@/modules/events/events.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { MediaModule } from '@/modules/media/media.module';
import { WebSocketModule } from '@/modules/websocket/websocket.module';
import { MailModule } from '@/modules/mail/mail.module';
import { HealthModule } from '@/modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        if (!dbConfig) throw new Error('Database config not found');
        return dbConfig;
      },
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot(),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    },{
      rootPath: join(__dirname, '..', 'frontend', 'dist'),
      serveRoot: '/',
    }),
    AuthModule,
    UsersModule,
    FamiliesModule,
    ChildrenModule,
    EventsModule,
    NotificationsModule,
    MediaModule,
    WebSocketModule,
    MailModule,
    HealthModule,
  ],
})
export class AppModule {}
