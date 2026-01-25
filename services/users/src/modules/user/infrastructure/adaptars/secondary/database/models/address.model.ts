import { BrazilStates } from '@modules/user/domain/enums/brazil-ufs.enum';
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

  @ManyToOne(() => UserModel, (user) => user.addresses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userID' })
  user: UserModel;

  @Column()
  street: string;

  @Column()
  number: string;

  @Column({ nullable: true })
  complement: string | undefined | null;

  @Column()
  neighborhood: string;

  @Column()
  city: string;

  @Column({ name: 'postal_code', length: 8 })
  postalCode: string;

  @Column({ length: 2 })
  state: BrazilStates;

  @Column()
  country: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
