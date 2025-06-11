import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Family } from '@/modules/families/entities/family.entity';

@Entity()
export class Invitation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Family, family => family.invitations)
  family: Family;
}

