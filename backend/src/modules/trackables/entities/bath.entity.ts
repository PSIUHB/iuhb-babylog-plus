import { Entity, Column } from 'typeorm';
import { Trackable } from './trackable.entity';

@Entity('baths')
export class Bath extends Trackable {
    @Column({ nullable: true })
    duration_minutes: number;

    @Column({ nullable: true })
    water_temperature: number;

    @Column({ nullable: true })
    products_used: string;
}