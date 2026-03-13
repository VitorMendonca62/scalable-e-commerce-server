import {
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import ProductModel from './product.model';

@Entity('product_favorites')
@Index(['userID', 'productID'], { unique: true })
export default class ProductFavoriteModel {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column({ type: 'uuid', nullable: false, name: 'user_id' })
  userID: string;

  @Column({ type: 'uuid', nullable: false, name: 'product_id' })
  productID: string;

  @ManyToOne(() => ProductModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id', referencedColumnName: 'publicID' })
  product: ProductModel;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
