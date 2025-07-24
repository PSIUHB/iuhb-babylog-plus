import { Entity, Column } from 'typeorm';
import { Trackable } from './trackable.entity';

export enum SleepQuality {
    POOR = 'poor',
    FAIR = 'fair',
    GOOD = 'good'
}

export enum SleepType {
    NAP = 'nap',
    NIGHT = 'night',
    OTHER = 'other'
}

export enum FallAsleepMethod {
    ROCKING = 'rocking',
    NURSING = 'nursing',
    BOTTLE = 'bottle',
    PACIFIER = 'pacifier',
    SELF_SOOTHING = 'self_soothing',
    OTHER = 'other'
}

export enum WakeUpBehavior {
    CALM = 'calm',
    CRYING = 'crying',
    FUSSY = 'fussy',
    HAPPY = 'happy'
}

export enum WakeUpReason {
    NATURAL = 'natural',
    NOISE = 'noise',
    HUNGER = 'hunger',
    DIAPER = 'diaper',
    DISCOMFORT = 'discomfort',
    OTHER = 'other'
}

@Entity('sleeps')
export class Sleep extends Trackable {

    @Column({
        type: 'enum',
        enum: SleepType,
        nullable: true
    })
    sleepType: SleepType;

    @Column({ type: 'timestamp', nullable: true })
    startTime: Date;

    @Column({ type: 'timestamp', nullable: true })
    endTime: Date;

    @Column({
        type: 'enum',
        enum: SleepQuality,
        nullable: true
    })
    quality: SleepQuality;

    @Column({ nullable: true })
    location: string;

    @Column({
        type: 'enum',
        enum: FallAsleepMethod,
        nullable: true
    })
    fallAsleepMethod: FallAsleepMethod;

    @Column({ nullable: true })
    startNotes: string;

    @Column({ nullable: true })
    environment: string;

    @Column({
        type: 'enum',
        enum: WakeUpBehavior,
        nullable: true
    })
    wakeUpBehavior: WakeUpBehavior;

    @Column({
        type: 'enum',
        enum: WakeUpReason,
        nullable: true
    })
    wakeUpReason: WakeUpReason;

    @Column({ nullable: true, default: false })
    isEstimated: boolean;
}