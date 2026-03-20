import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import { CategoryRepository } from '@product/domain/ports/secondary/category-repository.port';
import { CategoryFactory } from '@product/infrastructure/helpers/factories/category-factory';
import UpdateCategoryUseCase from './update-category.usecase';

describe('UpdateCategoryUseCase', () => {
  let useCase: UpdateCategoryUseCase;
  let categoryRepository: CategoryRepository;

  beforeEach(async () => {
    categoryRepository = {
      update: vi.fn(),
      exists: vi.fn(),
    } as any;

    useCase = new UpdateCategoryUseCase(categoryRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(categoryRepository).toBeDefined();
  });

  describe('execute', () => {
    const categoryEntity = CategoryFactory.createEntity();

    beforeEach(() => {
      vi.spyOn(categoryRepository, 'update').mockResolvedValue(true);
    });

    it('should call update with category updates', async () => {
      await useCase.execute(categoryEntity);

      expect(categoryRepository.update).toHaveBeenCalledWith(categoryEntity);
    });

    it('should return ok on success', async () => {
      const result = await useCase.execute(categoryEntity);

      expect(result).toEqual({
        ok: true,
      });
    });

    it('should return NOT_FOUND when update returns false', async () => {
      vi.spyOn(categoryRepository, 'update').mockResolvedValue(false);

      const result = await useCase.execute(categoryEntity);

      expect(result).toEqual({
        ok: false,
        message: 'Categoria não encontrada',
        reason: ApplicationResultReasons.NOT_FOUND,
      });
    });

    it('should return NOT_POSSIBLE when update throws error', async () => {
      vi.spyOn(categoryRepository, 'update').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await useCase.execute(categoryEntity);

      expect(result).toEqual({
        ok: false,
        message: 'Não foi possível atualizar a categoria',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });
  });
});
