import { CartItem } from '@product/domain/types/cart';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('carts')
export default class CartModel {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column({ type: 'uuid', nullable: false, name: 'public_id', unique: true })
  publicID: string;

  @Column({ type: 'uuid', nullable: false, name: 'user_id' })
  userID: string;

  @Column({ type: 'jsonb', nullable: false, default: () => "'[]'" })
  items: CartItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
