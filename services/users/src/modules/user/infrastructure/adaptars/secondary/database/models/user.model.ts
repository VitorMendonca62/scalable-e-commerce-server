import { PermissionsSystem } from '@user/domain/types/permissions';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v7 } from 'uuid';
import AddressModel from './address.model';

@Entity('users')
export default class UserModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, default: v7(), name: 'user_id' })
  userID: string;

  @Column()
  name: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true, name: 'phone_number' })
  phoneNumber: string;

  @Column({
    type: 'simple-array',
  })
  roles: PermissionsSystem[];

  @OneToMany(() => AddressModel, (address) => address.user)
  addresses: AddressModel[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;
}
