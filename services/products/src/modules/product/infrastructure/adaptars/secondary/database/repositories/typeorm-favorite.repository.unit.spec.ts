import { IDConstants } from '@product/domain/values-objects/constants';
import { CacheFavoritesRepository } from '@product/domain/ports/secondary/cache-favorite-repository.port';
import { Repository } from 'typeorm';
import ProductFavoriteModel from '../models/favorite.model';
import TypeOrmFavoriteRepository from './typeorm-favorite.repository';

describe('TypeOrmFavoriteRepository', () => {
  let repository: TypeOrmFavoriteRepository;
  let favoriteRepository: Repository<ProductFavoriteModel>;
  let cacheFavoritesRepository: CacheFavoritesRepository;

  beforeEach(() => {
    favoriteRepository = {
      create: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
    } as any;

    cacheFavoritesRepository = {
      isFavorite: vi.fn().mockResolvedValue(null),
      addFavorite: vi.fn(),
      removeFavorite: vi.fn(),
    } as any;

    repository = new TypeOrmFavoriteRepository(
      favoriteRepository,
      cacheFavoritesRepository,
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
    expect(favoriteRepository).toBeDefined();
  });

  describe('favorite', () => {
    const productID = IDConstants.EXEMPLE;
    const userID = 'user-123';
    const mockFavorite = {
      userID,
      productID,
    } as ProductFavoriteModel;

    beforeEach(() => {
      vi.spyOn(favoriteRepository, 'create').mockReturnValue(mockFavorite);
      vi.spyOn(favoriteRepository, 'save').mockResolvedValue(mockFavorite);
    });

    it('should call create with correct parameters', async () => {
      await repository.favorite(productID, userID);

      expect(favoriteRepository.create).toHaveBeenCalledWith({
        userID,
        productID,
      });
    });

    it('should call save with created favorite', async () => {
      await repository.favorite(productID, userID);

      expect(favoriteRepository.save).toHaveBeenCalledWith(mockFavorite);
    });

    it('should save favorite successfully and cache it', async () => {
      await repository.favorite(productID, userID);

      expect(favoriteRepository.create).toHaveBeenCalledTimes(1);
      expect(favoriteRepository.save).toHaveBeenCalledTimes(1);
      expect(cacheFavoritesRepository.addFavorite).toHaveBeenCalledWith(
        userID,
        productID,
      );
    });

    it('should handle different product IDs', async () => {
      const differentProductID = 'different-product-id';

      await repository.favorite(differentProductID, userID);

      expect(favoriteRepository.create).toHaveBeenCalledWith({
        userID,
        productID: differentProductID,
      });
    });

    it('should handle multiple favorites from same user', async () => {
      const productID1 = 'product-1';
      const productID2 = 'product-2';

      await repository.favorite(productID1, userID);
      await repository.favorite(productID2, userID);

      expect(favoriteRepository.create).toHaveBeenCalledTimes(2);
      expect(favoriteRepository.create).toHaveBeenNthCalledWith(1, {
        userID,
        productID: productID1,
      });
      expect(favoriteRepository.create).toHaveBeenNthCalledWith(2, {
        userID,
        productID: productID2,
      });
    });

    it('should handle multiple users favoriting same product', async () => {
      const userID1 = 'user-1';
      const userID2 = 'user-2';

      await repository.favorite(productID, userID1);
      await repository.favorite(productID, userID2);

      expect(favoriteRepository.create).toHaveBeenCalledTimes(2);
      expect(favoriteRepository.create).toHaveBeenNthCalledWith(1, {
        userID: userID1,
        productID,
      });
      expect(favoriteRepository.create).toHaveBeenNthCalledWith(2, {
        userID: userID2,
        productID,
      });
    });

    it('should return void', async () => {
      const result = await repository.favorite(productID, userID);

      expect(result).toBeUndefined();
    });
  });

  describe('unfavorite', () => {
    const productID = IDConstants.EXEMPLE;
    const userID = 'user-123';

    beforeEach(() => {
      vi.spyOn(favoriteRepository, 'delete').mockResolvedValue({
        affected: 1,
        raw: {},
      });
    });

    it('should call delete with correct parameters', async () => {
      await repository.unfavorite(productID, userID);

      expect(favoriteRepository.delete).toHaveBeenCalledWith({
        userID,
        productID,
      });
    });

    it('should return true when favorite is deleted (affected = 1)', async () => {
      const result = await repository.unfavorite(productID, userID);

      expect(result).toBe(true);
      expect(cacheFavoritesRepository.removeFavorite).toHaveBeenCalledWith(
        userID,
        productID,
      );
    });

    it('should return true when affected is greater than 1', async () => {
      vi.spyOn(favoriteRepository, 'delete').mockResolvedValue({
        affected: 3,
        raw: {},
      });

      const result = await repository.unfavorite(productID, userID);

      expect(result).toBe(true);
      expect(cacheFavoritesRepository.removeFavorite).toHaveBeenCalledWith(
        userID,
        productID,
      );
    });

    it('should return false when favorite does not exist (affected = 0)', async () => {
      vi.spyOn(favoriteRepository, 'delete').mockResolvedValue({
        affected: 0,
        raw: {},
      });

      const result = await repository.unfavorite(productID, userID);

      expect(result).toBe(false);
      expect(cacheFavoritesRepository.removeFavorite).not.toHaveBeenCalled();
    });

    it('should verify both userID and productID in delete clause', async () => {
      await repository.unfavorite(productID, userID);

      const callArgs = (favoriteRepository.delete as any).mock.calls[0][0];

      expect(callArgs).toHaveProperty('userID', userID);
      expect(callArgs).toHaveProperty('productID', productID);
      expect(Object.keys(callArgs)).toHaveLength(2);
    });

    it('should correctly evaluate affected != 0 logic', async () => {
      vi.spyOn(favoriteRepository, 'delete').mockResolvedValue({
        affected: 1,
        raw: {},
      });
      expect(await repository.unfavorite(productID, userID)).toBe(true);

      vi.spyOn(favoriteRepository, 'delete').mockResolvedValue({
        affected: 2,
        raw: {},
      });
      expect(await repository.unfavorite(productID, userID)).toBe(true);

      vi.spyOn(favoriteRepository, 'delete').mockResolvedValue({
        affected: 0,
        raw: {},
      });
      expect(await repository.unfavorite(productID, userID)).toBe(false);
    });

    it('should handle multiple unfavorite attempts on same product', async () => {
      vi.spyOn(favoriteRepository, 'delete').mockResolvedValue({
        affected: 1,
        raw: {},
      });
      const firstResult = await repository.unfavorite(productID, userID);
      expect(firstResult).toBe(true);

      vi.spyOn(favoriteRepository, 'delete').mockResolvedValue({
        affected: 0,
        raw: {},
      });
      const secondResult = await repository.unfavorite(productID, userID);
      expect(secondResult).toBe(false);
    });

    it('should handle unfavorite when user never favorited', async () => {
      vi.spyOn(favoriteRepository, 'delete').mockResolvedValue({
        affected: 0,
        raw: {},
      });

      const result = await repository.unfavorite(
        'non-existent-product',
        'non-existent-user',
      );

      expect(result).toBe(false);
    });
  });

  describe('isFavorite', () => {
    const productID = IDConstants.EXEMPLE;
    const userID = 'user-123';

    beforeEach(() => {
      vi.spyOn(favoriteRepository, 'exists').mockResolvedValue(true);
    });

    it('should call exists with correct parameters', async () => {
      await repository.isFavorite(productID, userID);

      expect(favoriteRepository.exists).toHaveBeenCalledWith({
        where: { userID, productID },
      });
    });

    it('should return true when favorite exists', async () => {
      const result = await repository.isFavorite(productID, userID);

      expect(result).toBe(true);
    });

    it('should return false when favorite does not exist', async () => {
      vi.spyOn(favoriteRepository, 'exists').mockResolvedValue(false);

      const result = await repository.isFavorite(productID, userID);

      expect(result).toBe(false);
    });

    it('should return cached favorite when available', async () => {
      vi.spyOn(cacheFavoritesRepository, 'isFavorite').mockResolvedValue(true);

      const result = await repository.isFavorite(productID, userID);

      expect(favoriteRepository.exists).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should cache favorite after db lookup', async () => {
      vi.spyOn(favoriteRepository, 'exists').mockResolvedValue(true);

      const result = await repository.isFavorite(productID, userID);

      expect(result).toBe(true);
      expect(cacheFavoritesRepository.addFavorite).toHaveBeenCalledWith(
        userID,
        productID,
      );
    });

    it('should clear cache when favorite does not exist', async () => {
      vi.spyOn(favoriteRepository, 'exists').mockResolvedValue(false);

      const result = await repository.isFavorite(productID, userID);

      expect(result).toBe(false);
      expect(cacheFavoritesRepository.removeFavorite).toHaveBeenCalledWith(
        userID,
        productID,
      );
    });
  });
});
