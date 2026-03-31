import { FindWithFiltersReturn, GetOneReturn } from './product-repository.port';

export type CachedProduct = Omit<GetOneReturn, 'isFavorited'>;

export abstract class CacheProductRepository {
  abstract getProduct(id: string): Promise<CachedProduct | null>;

  abstract addProduct(product: CachedProduct): Promise<void>;

  abstract getProductsByFilters(
    key: string,
  ): Promise<FindWithFiltersReturn[] | null>;

  abstract addProductsByFilters(
    key: string,
    products: FindWithFiltersReturn[],
  ): Promise<void>;

  abstract removeProduct(id: string): Promise<void>;

  abstract invalidateAll(): Promise<void>;
}
