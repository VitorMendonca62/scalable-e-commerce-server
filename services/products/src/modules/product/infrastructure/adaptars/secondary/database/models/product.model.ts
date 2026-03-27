import { PaymentTypes } from '@product/domain/enums/payments-types.enum';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import CategoryModel from './categories.model';

@Entity('products')
export default class ProductModel {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'uuid', nullable: false, name: 'public_id', unique: true })
  publicID: string;

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

  @Column({ type: 'uuid', nullable: false, name: 'category_id' })
  categoryID: string;

  @ManyToOne(() => CategoryModel, (category) => category.products)
  @JoinColumn({ name: 'category_id', referencedColumnName: 'publicID' })
  category: CategoryModel;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
