import { Entity, Column } from 'typeorm';
import { Trackable } from './trackable.entity';

export enum WeightUnit {
    KG = 'kg',
    LB = 'lb'
}

@Entity('weights')
export class Weight extends Trackable {
    @Column({ type: 'float' })
    value: number;

    @Column({
        type: 'enum',
        enum: WeightUnit
    })
    unit: WeightUnit;
}