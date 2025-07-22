import {Entity, PrimaryGeneratedColumn, ManyToOne, Column} from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { Child } from '@/modules/children/entities/child.entity';
import { ChildPermission } from '@/interfaces/child.interface';
export { ChildPermission };

@Entity()
export class UserChild {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  childId: string;

  @Column({
    type: 'enum',
    enum: ChildPermission,
    default: ChildPermission.READ
  })
  permission: ChildPermission;

  @ManyToOne(() => User, user => user.userChildren)
  user: User;

  @ManyToOne(() => Child, child => child.userChildren)
  child: Child;
}
