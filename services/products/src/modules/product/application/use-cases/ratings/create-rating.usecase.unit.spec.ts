import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import RatingRepository from '@product/domain/ports/secondary/rating-repository.port';
import RatingEntity from '@product/domain/entities/rating.entity';
import RatingMapper from '@product/infrastructure/mappers/rating.mapper';
import CreateRatingUseCase from './create-rating.usecase';

describe('CreateRatingUseCase', () => {
  let useCase: CreateRatingUseCase;
  let ratingRepository: RatingRepository;
  let ratingMapper: RatingMapper;

  beforeEach(() => {
    ratingRepository = {
      exists: vi.fn(),
      create: vi.fn(),
    } as any;

    ratingMapper = {
      entityForModel: vi.fn(),
    } as any;

    useCase = new CreateRatingUseCase(ratingRepository, ratingMapper);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(ratingRepository).toBeDefined();
    expect(ratingMapper).toBeDefined();
  });

  describe('execute', () => {
    const productID = 'product-123';
    const userID = 'user-456';
    const value = 4;
    const comment = 'Produto excelente';
    const images = ['aW1hZ2Ux', 'aW1hZ2Uy'];
    const ratingEntity = new RatingEntity({
      productID,
      userID,
      value,
      comment,
      images,
    });
    const ratingModel = {
      productID,
      userID,
      value,
      comment,
      images,
    } as any;

    beforeEach(() => {
      vi.spyOn(ratingRepository, 'exists').mockResolvedValue(false);
      vi.spyOn(ratingRepository, 'create').mockResolvedValue(undefined);
      vi.spyOn(ratingMapper, 'entityForModel').mockReturnValue(ratingModel);
    });

    it('should check if rating already exists', async () => {
      await useCase.execute(ratingEntity);

      expect(ratingRepository.exists).toHaveBeenCalledWith(productID, userID);
    });

    it('should return ALREADY_EXISTS when rating exists', async () => {
      vi.spyOn(ratingRepository, 'exists').mockResolvedValue(true);

      const result = await useCase.execute(ratingEntity);

      expect(result).toEqual({
        ok: false,
        message: 'O usuário já avaliou este produto',
        reason: ApplicationResultReasons.ALREADY_EXISTS,
      });
      expect(ratingRepository.create).not.toHaveBeenCalled();
    });

    it('should call create with correct parameters', async () => {
      await useCase.execute(ratingEntity);

      expect(ratingMapper.entityForModel).toHaveBeenCalledWith(ratingEntity);
      expect(ratingRepository.create).toHaveBeenCalledWith(ratingModel);
    });

    it('should return ok on success', async () => {
      const result = await useCase.execute(ratingEntity);

      expect(result).toEqual({ ok: true });
    });

    it('should return NOT_POSSIBLE when exists throws error', async () => {
      vi.spyOn(ratingRepository, 'exists').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await useCase.execute(ratingEntity);

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

      const result = await useCase.execute(ratingEntity);

      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel avaliar o produto',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });

    it('should return NOT_POSSIBLE when ratingMapper.entityForModel throws error', async () => {
      vi.spyOn(ratingMapper, 'entityForModel').mockImplementation(() => {
        throw new Error('Mapping error');
      });

      const result = await useCase.execute(ratingEntity);

      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel avaliar o produto',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });
  });
});
