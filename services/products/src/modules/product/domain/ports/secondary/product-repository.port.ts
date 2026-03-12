import ProductModel from '@product/infrastructure/adaptars/secondary/database/models/product.model';
import { ProductFilters } from '../application/get-products.port';

export default abstract class ProductRepository {
  abstract add(
    newProduct: Omit<ProductModel, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<void>;

  abstract getOne(fields: Partial<ProductModel>): Promise<ProductModel | null>;

  abstract findWithFilters(filters: ProductFilters): Promise<ProductModel[]>;

  abstract update(
    productID: string,
    userID: string,
    updates: Partial<ProductModel>,
  ): Promise<boolean>;
}
