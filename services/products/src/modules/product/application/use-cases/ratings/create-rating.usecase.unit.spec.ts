import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import RatingRepository from '@product/domain/ports/secondary/rating-repository.port';
import CreateRatingUseCase from './create-rating.usecase';

describe('CreateRatingUseCase', () => {
  let useCase: CreateRatingUseCase;
  let ratingRepository: RatingRepository;

  beforeEach(() => {
    ratingRepository = {
      exists: vi.fn(),
      create: vi.fn(),
    } as any;

    useCase = new CreateRatingUseCase(ratingRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(ratingRepository).toBeDefined();
  });

  describe('execute', () => {
    const productID = 'product-123';
    const userID = 'user-456';
    const value = 4;

    beforeEach(() => {
      vi.spyOn(ratingRepository, 'exists').mockResolvedValue(false);
      vi.spyOn(ratingRepository, 'create').mockResolvedValue(undefined);
    });

    it('should check if rating already exists', async () => {
      await useCase.execute(productID, userID, value);

      expect(ratingRepository.exists).toHaveBeenCalledWith(productID, userID);
    });

    it('should return ALREADY_EXISTS when rating exists', async () => {
      vi.spyOn(ratingRepository, 'exists').mockResolvedValue(true);

      const result = await useCase.execute(productID, userID, value);

      expect(result).toEqual({
        ok: false,
        message: 'O usuário já avaliou este produto',
        reason: ApplicationResultReasons.ALREADY_EXISTS,
      });
      expect(ratingRepository.create).not.toHaveBeenCalled();
    });

    it('should call create with correct parameters', async () => {
      await useCase.execute(productID, userID, value);

      expect(ratingRepository.create).toHaveBeenCalledWith(
        productID,
        userID,
        value,
      );
    });

    it('should return ok on success', async () => {
      const result = await useCase.execute(productID, userID, value);

      expect(result).toEqual({ ok: true });
    });

    it('should return NOT_POSSIBLE when exists throws error', async () => {
      vi.spyOn(ratingRepository, 'exists').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await useCase.execute(productID, userID, value);

      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel avaliar o produto',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });

    it('should return NOT_POSSIBLE when create throws error', async () => {
      vi.spyOn(ratingRepository, 'create').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await useCase.execute(productID, userID, value);

      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel avaliar o produto',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });
  });
});
