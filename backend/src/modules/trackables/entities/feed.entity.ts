import { Entity, Column } from 'typeorm';
import { Trackable } from './trackable.entity';

export enum FeedingMethod {
    BREAST = 'breast',
    BOTTLE = 'bottle',
    SOLID = 'solid'
}

export enum BreastSide {
    LEFT = 'left',
    RIGHT = 'right',
    BOTH = 'both'
}

@Entity('feeds')
export class Feed extends Trackable {
    @Column({
        type: 'enum',
        enum: FeedingMethod
    })
    method: FeedingMethod;

    @Column({ nullable: true })
    amount_ml: number;

    @Column({ nullable: true })
    duration_minutes: number;

    @Column({
        type: 'enum',
        enum: BreastSide,
        nullable: true
    })
    side: BreastSide;

    @Column({ nullable: true })
    food_type: string;
}