import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { Family } from '@/modules/families/entities/family.entity';

@Entity('invitations')
export class Invitation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    email: string;

    @Column({ nullable: true })
    role?: string;

    @ManyToOne(() => Family, (family) => family.invitations, { onDelete: 'CASCADE' })
    family: Family;

    @ManyToOne(() => User, { nullable: true })
    invitedBy?: User;

    @Column({ default: false })
    accepted: boolean;

    @Column({ nullable: false, unique: true })
    token: string;

    @CreateDateColumn()
    createdAt: Date;

    @CreateDateColumn()
    expiresAt: Date;

    @CreateDateColumn()
    acceptedAt: Date;
}

