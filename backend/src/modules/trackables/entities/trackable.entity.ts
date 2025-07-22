import { Entity, Column, ManyToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { Child } from '@/modules/children/entities/child.entity';
import { User } from '@/modules/users/entities/user.entity';

@Entity()
export abstract class Trackable extends BaseEntity {
    @Column()
    childId: string;

    @Column()
    createdByUserId: string;

    @Column({ type: 'timestamp' })
    occurredAt: Date;

    @Column({ nullable: true })
    notes: string;

    @Column({ type: 'jsonb', nullable: true })
    attachments: Array<{
        url: string;
        type: string;
        name: string;
    }>;

    @DeleteDateColumn()
    deletedAt: Date;

    @ManyToOne(() => Child)
    @JoinColumn({ name: 'childId' })
    child: Child;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'createdByUserId' })
    createdByUser: User;
}