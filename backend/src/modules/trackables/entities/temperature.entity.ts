import { Entity, Column } from 'typeorm';
import { Trackable } from './trackable.entity';

export enum TemperatureUnit {
    CELSIUS = 'celsius',
    FAHRENHEIT = 'fahrenheit'
}

export enum TemperatureLocation {
    ORAL = 'oral',
    RECTAL = 'rectal',
    ARMPIT = 'armpit',
    EAR = 'ear',
    FOREHEAD = 'forehead'
}

@Entity('temperatures')
export class Temperature extends Trackable {
    @Column({ type: 'float' })
    value: number;

    @Column({
        type: 'enum',
        enum: TemperatureUnit
    })
    unit: TemperatureUnit;

    @Column({
        type: 'enum',
        enum: TemperatureLocation,
        nullable: true
    })
    location: TemperatureLocation;
}