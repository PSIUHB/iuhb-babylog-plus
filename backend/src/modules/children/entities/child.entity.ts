import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { Family } from '@/modules/families/entities/family.entity';
import { UserChild } from '@/modules/children/entities/user-child.entity';
import { Event } from '@/modules/events/entities/event.entity';
import { MedicalRecord } from '@/modules/children/entities/medical-record.entity';
import { Gender } from '@/interfaces/child.interface';
export { Gender };

@Entity('children')
export class Child extends BaseEntity {
    @Column()
    familyId: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ type: 'date' })
    birthDate: Date;

    @Column({
        type: 'enum',
        enum: Gender,
        default: Gender.OTHER
    })
    gender: Gender;


    @Column({ nullable: true })
    avatarUrl: string;

    @Column({ type: 'float', nullable: true })
    birthWeightKg: number;

    @Column({ type: 'float', nullable: true })
    birthHeightCm: number;

    @Column({ nullable: true })
    notes: string;
    
    @Column({ default: 'active' })
    status: string;

    @ManyToOne(() => Family, family => family.children)
    @JoinColumn({ name: 'familyId' })
    family: Family;

    @OneToMany(() => UserChild, userChild => userChild.child)
    userChildren: UserChild[];

    @OneToMany(() => Event, event => event.child)
    events: Event[];

    @OneToMany(() => MedicalRecord, record => record.child)
    medicalRecords: MedicalRecord[];
}
