import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import { CategoryRepository } from '@product/domain/ports/secondary/category-repository.port';
import { CategoryFactory } from '@product/infrastructure/helpers/factories/category-factory';
import GetCategoriesUseCase from './get-categories.usecase';

describe('GetCategoriesUseCase', () => {
  let useCase: GetCategoriesUseCase;
  let categoryRepository: CategoryRepository;

  beforeEach(async () => {
    categoryRepository = {
      findAll: vi.fn(),
    } as any;

    useCase = new GetCategoriesUseCase(categoryRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(categoryRepository).toBeDefined();
  });

  describe('getAll', () => {
    const cursor = '123';
    const nextCursor = '1234';
    const categories = [
      CategoryFactory.createModel(),
      CategoryFactory.createModel({ name: 'Fashion' }),
    ];

    beforeEach(() => {
      vi.spyOn(categoryRepository, 'findAll').mockResolvedValue([
        categories,
        nextCursor,
      ]);
    });

    it('should call findAll with page', async () => {
      await useCase.getAll(cursor);

      expect(categoryRepository.findAll).toHaveBeenCalledWith(cursor);
    });

    it('should return ok with categories on success', async () => {
      const result = await useCase.getAll(cursor);

      expect(result).toEqual({
        ok: true,
        result: [categories, nextCursor],
      });
    });

    it('should return empty array when no categories exist', async () => {
      vi.spyOn(categoryRepository, 'findAll').mockResolvedValue([[], null]);

      const result = await useCase.getAll(cursor);

      expect(result).toEqual({
        ok: true,
        result: [[], null],
      });
    });

    it('should return NOT_POSSIBLE when findAll throws error', async () => {
      vi.spyOn(categoryRepository, 'findAll').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await useCase.getAll(cursor);

      expect(result).toEqual({
        ok: false,
        message: 'Não foi possível buscar as categorias',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });
  });
});
