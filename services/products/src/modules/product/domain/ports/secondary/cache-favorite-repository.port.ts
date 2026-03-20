export abstract class CacheFavoritesRepository {
  abstract isFavorite(userID: string, productID: string): Promise<boolean>;

  abstract addFavorite(userID: string, productID: string): Promise<void>;

  abstract removeFavorite(userID: string, productID: string): Promise<void>;
}
