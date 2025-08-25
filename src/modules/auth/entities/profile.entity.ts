import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';

@Entity('profiles')
export class Profile extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 55 })
  name: string;

  @Column({ length: 55 })
  lastname: string;

  @Column({ length: 55, unique: true })
  dni: string;

  @Column({ name: 'personal_phone_number', length: 55, unique: true })
  personalPhoneNumber: string;

  @Column({ length: 155, nullable: true })
  photo: string;

  @OneToOne(() => User, (user) => user.profile, { cascade: false })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
