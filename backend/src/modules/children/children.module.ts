import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChildrenController } from './children.controller';
import { ChildrenService } from './children.service';
import { Child } from './entities/child.entity';
import { UserChild } from './entities/user-child.entity';
import { FamiliesModule } from '@/modules/families/families.module';
import { EventsModule } from '@/modules/events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Child, UserChild]),
    forwardRef(() => FamiliesModule),
    forwardRef(() => EventsModule),
  ],
  controllers: [ChildrenController],
  providers: [ChildrenService],
  exports: [ChildrenService],
})
export class ChildrenModule {}
