import { Entity, Column } from 'typeorm';
import { Trackable } from './trackable.entity';

export enum DiaperType {
    WET = 'wet',
    DIRTY = 'dirty',
    BOTH = 'both'
}

@Entity('diapers')
export class Diaper extends Trackable {
    @Column({
        type: 'enum',
        enum: DiaperType
    })
    type: DiaperType;

    @Column({ nullable: true })
    consistency: string;

    @Column({ nullable: true })
    color: string;
}