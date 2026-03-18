import CartModel from '@product/infrastructure/adaptars/secondary/database/models/cart.model';

export default abstract class CartRepository {
  abstract add(
    newCart: Omit<CartModel, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<void>;

  abstract getOne(
    publicID: string,
    userID: string,
  ): Promise<Omit<CartModel, 'id' | 'userID'> | null>;

  abstract findByUser(
    userID: string,
  ): Promise<Omit<CartModel, 'id' | 'userID'>[]>;

  abstract update(
    cartID: string,
    userID: string,
    updates: Partial<CartModel>,
  ): Promise<boolean>;

  abstract delete(cartID: string, userID: string): Promise<boolean>;
}
