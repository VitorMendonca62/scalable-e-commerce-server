import {
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import ProductModel from './product.model';

@Entity('product_ratings')
@Index(['userID', 'productID'], { unique: true })
export default class ProductRatingModel {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column({ type: 'uuid', nullable: false, name: 'user_id' })
  userID: string;

  @Column({ type: 'uuid', nullable: false, name: 'product_id' })
  productID: string;

  @Column({ type: 'int2', nullable: false })
  value: number;

  @ManyToOne(() => ProductModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id', referencedColumnName: 'publicID' })
  product: ProductModel;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
