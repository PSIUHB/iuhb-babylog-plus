import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Event } from './entities/event.entity';
import { ChildrenModule } from '@/modules/children/children.module';
import { WebSocketModule } from '@/modules/websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event]),
    ChildrenModule,
    WebSocketModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
