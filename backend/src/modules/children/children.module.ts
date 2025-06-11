import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChildrenController } from './children.controller';
import { ChildrenService } from './children.service';
import { Child } from './entities/child.entity';
import { UserChild } from './entities/user-child.entity';
import { FamiliesModule } from '@/modules/families/families.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Child, UserChild]),
    FamiliesModule,
  ],
  controllers: [ChildrenController],
  providers: [ChildrenService],
  exports: [ChildrenService],
})
export class ChildrenModule {}
