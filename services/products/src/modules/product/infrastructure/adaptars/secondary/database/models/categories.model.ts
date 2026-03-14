import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import ProductModel from './product.model';

@Entity('categories')
export default class CategoryModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 150, nullable: false, unique: true })
  slug: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @OneToMany(() => ProductModel, (product) => product.category)
  products: ProductModel[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
