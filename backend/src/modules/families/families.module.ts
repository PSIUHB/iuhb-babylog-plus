import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamiliesService } from './families.service';
import { FamiliesController } from './families.controller';
import { Family } from './entities/family.entity';
import { UserFamily } from './entities/user-family.entity';
import { Invitation } from './entities/invitation.entity';
import { EventsModule } from '@/modules/events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Family, UserFamily, Invitation]),
    forwardRef(() => EventsModule),
  ],
  controllers: [FamiliesController],
  providers: [FamiliesService],
  exports: [FamiliesService],
})
export class FamiliesModule {}
