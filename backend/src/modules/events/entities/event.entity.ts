import { Entity, Column, ManyToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { Child } from '@/modules/children/entities/child.entity';
import { User } from '@/modules/users/entities/user.entity';

export enum EventType {
    FEEDING = 'feeding',
    DIAPER = 'diaper',
    SLEEP = 'sleep',
    MEDICINE = 'medicine',
    TEMPERATURE = 'temperature',
    WEIGHT = 'weight',
    HEIGHT = 'height',
    ACTIVITY = 'activity',
    NOTE = 'note'
}

@Entity('events')
export class Event extends BaseEntity {
    @Column()
    childId: string;

    @Column()
    createdByUserId: string;

    @Column({
        type: 'enum',
        enum: EventType
    })
    type: EventType;

    @Column({ type: 'jsonb' })
    data: Record<string, any>;

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

    @ManyToOne(() => Child, child => child.events)
    @JoinColumn({ name: 'childId' })
    child: Child;

    @ManyToOne(() => User, user => user.createdEvents)
    @JoinColumn({ name: 'createdByUserId' })
    createdByUser: User;
}