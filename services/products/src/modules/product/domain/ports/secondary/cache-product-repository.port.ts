import ProductModel from '@product/infrastructure/adaptars/secondary/database/models/product.model';

// TODO VERICIAR SE VAI COLOCAR O POR FILTROS
export abstract class CacheProductRepository {
  abstract getProduct(
    id: string,
  ): Promise<(Omit<ProductModel, 'id'> & { rating: number })[] | null>;

  abstract addProduct(
    product: Omit<ProductModel, 'id'> & { rating: number },
  ): void;

  abstract removeProduct(id: string): Promise<void>;
}
