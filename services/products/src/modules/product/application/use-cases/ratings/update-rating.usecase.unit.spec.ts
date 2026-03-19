import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import RatingRepository from '@product/domain/ports/secondary/rating-repository.port';
import UpdateRatingUseCase from './update-rating.usecase';

describe('UpdateRatingUseCase', () => {
  let useCase: UpdateRatingUseCase;
  let ratingRepository: RatingRepository;

  beforeEach(() => {
    ratingRepository = {
      update: vi.fn(),
    } as any;

    useCase = new UpdateRatingUseCase(ratingRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(ratingRepository).toBeDefined();
  });

  describe('execute', () => {
    const productID = 'product-123';
    const userID = 'user-456';
    const value = 5;

    beforeEach(() => {
      vi.spyOn(ratingRepository, 'update').mockResolvedValue(true);
    });

    it('should call update with correct parameters', async () => {
      await useCase.execute(productID, userID, value);

      expect(ratingRepository.update).toHaveBeenCalledWith(productID, userID, {
        value,
      });
    });

    it('should return ok on success', async () => {
      const result = await useCase.execute(productID, userID, value);

      expect(result).toEqual({ ok: true });
    });

    it('should return NOT_FOUND when update returns false', async () => {
      vi.spyOn(ratingRepository, 'update').mockResolvedValue(false);

      const result = await useCase.execute(productID, userID, value);

      expect(result).toEqual({
        ok: false,
        reason: ApplicationResultReasons.NOT_FOUND,
        message: 'Avaliação não encontrada',
      });
    });

    it('should return NOT_POSSIBLE when update throws error', async () => {
      vi.spyOn(ratingRepository, 'update').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await useCase.execute(productID, userID, value);

      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel atualizar a avaliação',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });
  });
});
