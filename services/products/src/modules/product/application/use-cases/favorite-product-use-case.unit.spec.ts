import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import FavoriteRepository from '@product/domain/ports/secondary/favorite-repository.port';
import { IDConstants } from '@product/domain/values-objects/constants';
import FavoriteProductUseCase from './favorite-product-use-case';

describe('FavoriteProductUseCase', () => {
  let useCase: FavoriteProductUseCase;
  let favoriteRepository: FavoriteRepository;

  beforeEach(async () => {
    favoriteRepository = {
      favorite: vi.fn(),
      unfavorite: vi.fn(),
      isFavorite: vi.fn(),
    } as any;

    useCase = new FavoriteProductUseCase(favoriteRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(favoriteRepository).toBeDefined();
  });

  describe('favorite', () => {
    const productID = IDConstants.EXEMPLE;
    const userID = 'user-123';

    beforeEach(() => {
      vi.spyOn(favoriteRepository, 'isFavorite').mockResolvedValue(false);
      vi.spyOn(favoriteRepository, 'favorite').mockResolvedValue(undefined);
    });

    it('should call isFavorite to check if already favorited', async () => {
      await useCase.favorite(productID, userID);

      expect(favoriteRepository.isFavorite).toHaveBeenCalledWith(
        productID,
        userID,
      );
    });

    it('should return ok true when product is already favorited', async () => {
      vi.spyOn(favoriteRepository, 'isFavorite').mockResolvedValue(true);

      const result = await useCase.favorite(productID, userID);

      expect(result).toEqual({
        ok: true,
      });
      expect(favoriteRepository.favorite).not.toHaveBeenCalled();
    });

    it('should call favorite when product is not favorited yet', async () => {
      await useCase.favorite(productID, userID);

      expect(favoriteRepository.favorite).toHaveBeenCalledWith(
        productID,
        userID,
      );
    });

    it('should return ok true after favoriting successfully', async () => {
      const result = await useCase.favorite(productID, userID);

      expect(result).toEqual({
        ok: true,
      });
    });

    it('should return NOT_POSSIBLE if isFavorite throws error', async () => {
      vi.spyOn(favoriteRepository, 'isFavorite').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await useCase.favorite(productID, userID);

      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel favoritar o produto',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });

    it('should return NOT_POSSIBLE if favorite throws error', async () => {
      vi.spyOn(favoriteRepository, 'favorite').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await useCase.favorite(productID, userID);

      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel favoritar o produto',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });

    it('should handle duplicate favorite attempts gracefully', async () => {
      vi.spyOn(favoriteRepository, 'isFavorite')
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);

      const result1 = await useCase.favorite(productID, userID);
      const result2 = await useCase.favorite(productID, userID);

      expect(result1.ok).toBe(true);
      expect(result2.ok).toBe(true);
      expect(favoriteRepository.favorite).toHaveBeenCalledTimes(1);
    });
  });

  describe('unfavorite', () => {
    const productID = IDConstants.EXEMPLE;
    const userID = 'user-123';

    beforeEach(() => {
      vi.spyOn(favoriteRepository, 'unfavorite').mockResolvedValue(true);
    });

    it('should call unfavorite with correct parameters', async () => {
      await useCase.unfavorite(productID, userID);

      expect(favoriteRepository.unfavorite).toHaveBeenCalledWith(
        productID,
        userID,
      );
    });

    it('should return ok true when unfavorite is successful', async () => {
      const result = await useCase.unfavorite(productID, userID);

      expect(result).toEqual({
        ok: true,
      });
    });

    it('should return NOT_FOUND when product was not favorited', async () => {
      vi.spyOn(favoriteRepository, 'unfavorite').mockResolvedValue(false);

      const result = await useCase.unfavorite(productID, userID);

      expect(result).toEqual({
        ok: false,
        reason: ApplicationResultReasons.NOT_FOUND,
        message: 'Não foi possivel encontrar o produto',
      });
    });

    it('should return NOT_POSSIBLE if unfavorite throws error', async () => {
      vi.spyOn(favoriteRepository, 'unfavorite').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await useCase.unfavorite(productID, userID);

      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel favoritar o produto',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });

    it('should handle multiple unfavorite attempts', async () => {
      vi.spyOn(favoriteRepository, 'unfavorite')
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      const result1 = await useCase.unfavorite(productID, userID);
      const result2 = await useCase.unfavorite(productID, userID);

      expect(result1).toEqual({ ok: true });
      expect(result2).toEqual({
        ok: false,
        reason: ApplicationResultReasons.NOT_FOUND,
        message: 'Não foi possivel encontrar o produto',
      });
    });

    it('should handle unfavorite when never favorited', async () => {
      vi.spyOn(favoriteRepository, 'unfavorite').mockResolvedValue(false);

      const result = await useCase.unfavorite(
        'never-favorited-product',
        'some-user',
      );

      expect(result).toEqual({
        ok: false,
        reason: ApplicationResultReasons.NOT_FOUND,
        message: 'Não foi possivel encontrar o produto',
      });
    });

    it('should handle repository returning false correctly', async () => {
      vi.spyOn(favoriteRepository, 'unfavorite').mockResolvedValue(false);

      const result = await useCase.unfavorite(productID, userID);

      expect(result.ok).toBe(false);
      if (result.ok === false) {
        expect(result.reason).toBe(ApplicationResultReasons.NOT_FOUND);
      }
    });

    it('should handle repository returning true correctly', async () => {
      vi.spyOn(favoriteRepository, 'unfavorite').mockResolvedValue(true);

      const result = await useCase.unfavorite(productID, userID);

      expect(result.ok).toBe(true);
      expect(result).not.toHaveProperty('reason');
      expect(result).not.toHaveProperty('message');
    });
  });
});
