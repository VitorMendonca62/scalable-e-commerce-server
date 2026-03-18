import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import { CategoryRepository } from '@product/domain/ports/secondary/category-repository.port';
import DeleteCategoryUseCase from './delete-category.usecase';

describe('DeleteCategoryUseCase', () => {
  let useCase: DeleteCategoryUseCase;
  let categoryRepository: CategoryRepository;

  beforeEach(async () => {
    categoryRepository = {
      delete: vi.fn(),
    } as any;

    useCase = new DeleteCategoryUseCase(categoryRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(categoryRepository).toBeDefined();
  });

  describe('execute', () => {
    const categoryID = 'category-id';

    beforeEach(() => {
      vi.spyOn(categoryRepository, 'delete').mockResolvedValue(true);
    });

    it('should call delete with category id', async () => {
      await useCase.execute(categoryID);

      expect(categoryRepository.delete).toHaveBeenCalledWith(categoryID);
    });

    it('should return ok on success', async () => {
      const result = await useCase.execute(categoryID);

      expect(result).toEqual({
        ok: true,
      });
    });

    it('should return NOT_FOUND when category does not exist', async () => {
      vi.spyOn(categoryRepository, 'delete').mockResolvedValue(false);

      const result = await useCase.execute(categoryID);

      expect(result).toEqual({
        ok: false,
        message: 'Categoria não encontrada',
        reason: ApplicationResultReasons.NOT_FOUND,
      });
    });

    it('should return NOT_POSSIBLE when delete throws error', async () => {
      vi.spyOn(categoryRepository, 'delete').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await useCase.execute(categoryID);

      expect(result).toEqual({
        ok: false,
        message: 'Não foi possível deletar a categoria',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });
  });
});
