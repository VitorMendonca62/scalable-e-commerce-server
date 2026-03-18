vi.mock('uuid', () => ({
  v7: () => 'uuid-123',
}));

import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import { CategoryRepository } from '@product/domain/ports/secondary/category-repository.port';
import { CategoryFactory } from '@product/infrastructure/helpers/factories/category-factory';
import CreateCategoryUseCase from './create-category.usecase';

describe('CreateCategoryUseCase', () => {
  let useCase: CreateCategoryUseCase;
  let categoryRepository: CategoryRepository;

  beforeEach(async () => {
    categoryRepository = {
      create: vi.fn(),
      exists: vi.fn(),
    } as any;

    useCase = new CreateCategoryUseCase(categoryRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(categoryRepository).toBeDefined();
  });

  describe('execute', () => {
    const categoryEntity = CategoryFactory.createEntity();

    beforeEach(() => {
      vi.spyOn(categoryRepository, 'exists').mockResolvedValue(false);
      vi.spyOn(categoryRepository, 'create').mockResolvedValue(undefined);
    });

    it('should check if slug already exists', async () => {
      await useCase.execute(categoryEntity);

      expect(categoryRepository.exists).toHaveBeenCalledWith(
        categoryEntity.slug,
      );
    });

    it('should return ALREADY_EXISTS when slug exists', async () => {
      vi.spyOn(categoryRepository, 'exists').mockResolvedValue(true);

      const result = await useCase.execute(categoryEntity);

      expect(result).toEqual({
        ok: false,
        message: 'Já existe uma categoria com este slug',
        reason: ApplicationResultReasons.ALREADY_EXISTS,
      });
      expect(categoryRepository.create).not.toHaveBeenCalled();
    });

    it('should call create with mapped category data', async () => {
      await useCase.execute(categoryEntity);

      expect(categoryRepository.create).toHaveBeenCalledWith({
        publicID: 'uuid-123',
        name: categoryEntity.name,
        slug: categoryEntity.slug,
        active: categoryEntity.active,
      });
    });

    it('should return ok on success', async () => {
      const result = await useCase.execute(categoryEntity);

      expect(result).toEqual({
        ok: true,
      });
    });

    it('should return NOT_POSSIBLE when exists throws error', async () => {
      vi.spyOn(categoryRepository, 'exists').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await useCase.execute(categoryEntity);

      expect(result).toEqual({
        ok: false,
        message: 'Não foi possível criar a categoria',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });

    it('should return NOT_POSSIBLE when create throws error', async () => {
      vi.spyOn(categoryRepository, 'create').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await useCase.execute(categoryEntity);

      expect(result).toEqual({
        ok: false,
        message: 'Não foi possível criar a categoria',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });
  });
});
