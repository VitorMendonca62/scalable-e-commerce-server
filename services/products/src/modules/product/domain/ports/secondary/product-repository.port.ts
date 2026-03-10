import ProductModel from '@product/infrastructure/adaptars/secondary/database/models/product.model';

export default abstract class ProductRepository {
  abstract add(
    newProduct: Omit<ProductModel, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<void>;
}
