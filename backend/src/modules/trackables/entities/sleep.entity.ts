import { Entity, Column } from 'typeorm';
import { Trackable } from './trackable.entity';

export enum SleepStatus {
    START = 'start',
    END = 'end'
}

export enum SleepQuality {
    POOR = 'poor',
    FAIR = 'fair',
    GOOD = 'good'
}

@Entity('sleeps')
export class Sleep extends Trackable {
    @Column({
        type: 'enum',
        enum: SleepStatus
    })
    status: SleepStatus;

    @Column({ nullable: true })
    duration_minutes: number;

    @Column({
        type: 'enum',
        enum: SleepQuality,
        nullable: true
    })
    quality: SleepQuality;

    @Column({ nullable: true })
    location: string;
}