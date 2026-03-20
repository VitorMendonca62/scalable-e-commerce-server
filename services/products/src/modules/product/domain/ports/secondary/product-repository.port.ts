import ProductModel from '@product/infrastructure/adaptars/secondary/database/models/product.model';
import { ProductFilters } from '../application/product/get-products.port';

type NoPublicFields = 'id' | 'active' | 'categoryID';

export interface GetOneReturn extends Omit<ProductModel, NoPublicFields> {
  isFavorited: boolean;
  rating: number;
}

export interface FindWithFiltersReturn extends Omit<
  ProductModel,
  NoPublicFields | 'description'
> {
  rating: number;
}
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
  ): Promise<GetOneReturn | null>;

  abstract findWithFilters(
    filters: ProductFilters,
  ): Promise<FindWithFiltersReturn[]>;

  abstract update(
    productID: string,
    userID: string,
    updates: Partial<ProductModel>,
  ): Promise<boolean>;
}
