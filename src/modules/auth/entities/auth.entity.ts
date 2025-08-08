import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Auth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'auth_id', type: 'uuid', unique: true })
  authId: string;

  @Column({ length: 100, unique: true })
  email: string;

  // @Column({ length: 155 })
  // password: string;

  @Column({ type: 'boolean', default: false })
  verified: boolean;
}
