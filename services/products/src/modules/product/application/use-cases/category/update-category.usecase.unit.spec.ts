import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import CategoryEntity from '@product/domain/entities/category.entity';
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
      vi.spyOn(categoryRepository, 'exists').mockResolvedValue(false);
      vi.spyOn(categoryRepository, 'update').mockResolvedValue(true);
    });

    it('should check if slug exists when slug is provided', async () => {
      await useCase.execute(categoryEntity);

      expect(categoryRepository.exists).toHaveBeenCalledWith(
        categoryEntity.slug,
      );
    });

    it('should not check exists when slug is not provided', async () => {
      const updates: Partial<CategoryEntity> = {
        name: categoryEntity.name,
      };

      await useCase.execute(updates);

      expect(categoryRepository.exists).not.toHaveBeenCalled();
    });

    it('should return ALREADY_EXISTS when slug exists', async () => {
      vi.spyOn(categoryRepository, 'exists').mockResolvedValue(true);

      const result = await useCase.execute(categoryEntity);

      expect(result).toEqual({
        ok: false,
        message: 'Já existe uma categoria com este slug',
        reason: ApplicationResultReasons.ALREADY_EXISTS,
      });
      expect(categoryRepository.update).not.toHaveBeenCalled();
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

    it('should return NOT_POSSIBLE when exists throws error', async () => {
      vi.spyOn(categoryRepository, 'exists').mockRejectedValue(
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
