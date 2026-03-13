export default abstract class FavoriteRepository {
  abstract favorite(productID: string, userID: string): Promise<void>;
  abstract unfavorite(productID: string, userID: string): Promise<boolean>;
  abstract isFavorite(productID: string, userID: string): Promise<boolean>;
}
