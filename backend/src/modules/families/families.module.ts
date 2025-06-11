import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamiliesService } from './families.service';
import { Family } from './entities/family.entity';
import { UserFamily } from './entities/user-family.entity';
import { Invitation } from './entities/invitation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Family, UserFamily, Invitation])],
  controllers: [],
  providers: [FamiliesService],
  exports: [FamiliesService],
})
export class FamiliesModule {}
