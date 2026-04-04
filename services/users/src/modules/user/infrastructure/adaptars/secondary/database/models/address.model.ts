import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import UserModel from './user.model';

@Entity('addresses')
export default class AddressModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', nullable: false, name: 'user_id' })
  userID: string;

  @ManyToOne(() => UserModel, (user) => user.addresses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userID' })
  user: UserModel;

  @Column({ type: 'varchar', length: 255 })
  street: string;

  @Column({ type: 'varchar', length: 10 })
  number: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  complement?: string | null;

  @Column({ type: 'varchar', length: 100 })
  neighborhood: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ name: 'postal_code', type: 'varchar', length: 8 })
  postalCode: string;

  @Column({ type: 'varchar', length: 2 })
  state: string;

  @Column({ type: 'varchar', length: 100 })
  country: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
