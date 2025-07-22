import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Event } from './entities/event.entity';
import { ChildrenModule } from '@/modules/children/children.module';
import { WebSocketModule } from '@/modules/websocket/websocket.module';
import { MilestonesModule } from '@/modules/milestones/milestones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event]),
    forwardRef(() => ChildrenModule),
    WebSocketModule,
    MilestonesModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
