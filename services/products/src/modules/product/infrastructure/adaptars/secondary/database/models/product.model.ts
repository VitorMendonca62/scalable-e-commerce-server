import { PaymentTypes } from '@product/domain/enums/payments-types.enum';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export default class ProductModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'int4', nullable: false })
  price: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  overview: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'simple-array', nullable: false })
  photos: string[];

  @Column({ type: 'simple-array', nullable: false })
  payments: PaymentTypes[];

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'uuid', nullable: false })
  owner: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
