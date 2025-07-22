import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Child } from '@/modules/children/entities/child.entity';

@Entity()
export class MedicalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Child, child => child.medicalRecords)
  child: Child;
}
