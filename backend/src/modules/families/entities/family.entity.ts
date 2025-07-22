import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { UserFamily } from '@/modules/families/entities/user-family.entity';
import { Child } from '@/modules/children/entities/child.entity';
import { Invitation } from '@/modules/families/entities/invitation.entity';

@Entity('families')
export class Family extends BaseEntity {
    @Column()
    name: string;

    @Column({ unique: true })
    inviteCode: string;

    @Column({ type: 'jsonb', nullable: true })
    settings: Record<string, any>;

    @OneToMany(() => UserFamily, (userFamily: UserFamily) => userFamily.family)
    userFamilies: UserFamily[];

    @OneToMany(() => Child, child => child.family)
    children: Child[];

    @OneToMany(() => Invitation, (invitation: Invitation) => invitation.family)
    invitations: Invitation[];
}
