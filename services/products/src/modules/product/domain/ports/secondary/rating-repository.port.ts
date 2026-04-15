import ProductRatingModel from '@product/infrastructure/adaptars/secondary/database/models/rating.model';

export default abstract class RatingRepository {
  abstract create(
    newRating: Omit<
      ProductRatingModel,
      'id' | 'createdAt' | 'updatedAt' | 'product'
    >,
  ): Promise<void>;

  abstract update(
    productID: string,
    userID: string,
    updates: Partial<ProductRatingModel>,
  ): Promise<boolean>;

  abstract exists(productID: string, userID: string): Promise<boolean>;
}
