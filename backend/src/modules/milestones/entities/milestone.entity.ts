import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { MilestoneCategory } from '@/interfaces/milestone.interface';

@Entity('milestones')
export class Milestone extends BaseEntity {
    @Column({
        type: 'enum',
        enum: MilestoneCategory,
        enumName: 'milestones_category_enum'
    })
    category: MilestoneCategory;

    @Column({ nullable: false })
    milestone: string;

    @Column({ nullable: false })
    expectedAgeMonths: number;

    @Column('int', { array: true, nullable: false })
    ageRangeMonths: number[];
}