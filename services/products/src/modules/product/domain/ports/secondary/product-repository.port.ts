import ProductModel from '@product/infrastructure/adaptars/secondary/database/models/product.model';
import { ProductFilters } from '../application/product/get-products.port';

export default abstract class ProductRepository {
  abstract add(
    newProduct: Omit<
      ProductModel,
      'id' | 'createdAt' | 'updatedAt' | 'category'
    >,
  ): Promise<void>;

  abstract getOne(
    publicID: string,
    userID: string,
  ): Promise<(Omit<ProductModel, 'id'> & { isFavorited: boolean }) | null>;

  abstract findWithFilters(filters: ProductFilters): Promise<ProductModel[]>;

  abstract update(
    productID: string,
    userID: string,
    updates: Partial<ProductModel>,
  ): Promise<boolean>;
}
