import { Entity, Column, OneToMany, ManyToMany, BeforeInsert } from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { BaseEntity } from '@/common/entities/base.entity';
import { UserFamily } from '@/modules/families/entities/user-family.entity';
import { UserChild } from '@/modules/children/entities/user-child.entity';
import { Event } from '@/modules/events/entities/event.entity';
import { Notification } from '@/modules/notifications/entities/notification.entity';

@Entity('users')
export class User extends BaseEntity {
    @Column({ unique: true })
    email: string;

    @Column()
    @Exclude()
    passwordHash: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ nullable: true })
    avatarUrl: string;

    @Column({ default: 'de' })
    locale: string;

    @Column({ default: 'Europe/Berlin' })
    timezone: string;

    @Column({ default: false })
    emailVerified: boolean;

    @Column({ type: 'timestamp', nullable: true })
    lastLoginAt: Date;

    @OneToMany(() => UserFamily, (userFamily: UserFamily) => userFamily.user)
    userFamilies: UserFamily[];

    @OneToMany(() => UserChild, (userChild: UserChild) => userChild.user)
    userChildren: UserChild[];

    @OneToMany(() => Event, event => event.createdByUser)
    createdEvents: Event[];

    @OneToMany(() => Notification, (notification: Notification) => notification.user)
    notifications: Notification[];

    @BeforeInsert()
    async hashPassword() {
        if (this.passwordHash) {
            this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
        }
    }

    async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.passwordHash);
    }
}