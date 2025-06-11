import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Family } from '@/modules/families/entities/family.entity';

export enum FamilyRole {
	ADMIN = 'admin',
	PARENT = 'parent',
	CAREGIVER = 'caregiver',
	VIEWER = 'viewer'
}

@Entity('user_families')
export class UserFamily extends BaseEntity {
	@Column()
	userId: string;

	@Column()
	familyId: string;

	@Column({
		type: 'enum',
		enum: FamilyRole,
		default: FamilyRole.PARENT
	})
	role: FamilyRole;

	@Column({ default: false })
	isPrimary: boolean;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	joinedAt: Date;

	@Column({ type: 'timestamp', nullable: true })
	leftAt: Date;

	@ManyToOne(() => User, user => user.userFamilies)
	@JoinColumn({ name: 'userId' })
	user: User;

	@ManyToOne(() => Family, family => family.userFamilies)
	@JoinColumn({ name: 'familyId' })
	family: Family;
}