import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import { CategoryRepository } from '@product/domain/ports/secondary/category-repository.port';
import { CategoryFactory } from '@product/infrastructure/helpers/factories/category-factory';
import GetCategoryUseCase from './get-category.usecase';

describe('GetCategoryUseCase', () => {
  let useCase: GetCategoryUseCase;
  let categoryRepository: CategoryRepository;

  beforeEach(async () => {
    categoryRepository = {
      findBySlug: vi.fn(),
    } as any;

    useCase = new GetCategoryUseCase(categoryRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(categoryRepository).toBeDefined();
  });

  describe('getBySlug', () => {
    const slug = 'category-slug';
    const categoryModel = CategoryFactory.createModel();

    beforeEach(() => {
      vi.spyOn(categoryRepository, 'findBySlug').mockResolvedValue(
        categoryModel,
      );
    });

    it('should call findBySlug with slug', async () => {
      await useCase.getBySlug(slug);

      expect(categoryRepository.findBySlug).toHaveBeenCalledWith(slug);
    });

    it('should return ok with category data on success', async () => {
      const result = await useCase.getBySlug(slug);

      expect(result).toEqual({
        ok: true,
        result: {
          publicID: categoryModel.publicID,
          name: categoryModel.name,
          slug: categoryModel.slug,
          active: categoryModel.active,
        },
      });
    });

    it('should return NOT_FOUND when category does not exist', async () => {
      vi.spyOn(categoryRepository, 'findBySlug').mockResolvedValue(null);

      const result = await useCase.getBySlug(slug);

      expect(result).toEqual({
        ok: false,
        message: 'Categoria não encontrada',
        reason: ApplicationResultReasons.NOT_FOUND,
      });
    });

    it('should return NOT_POSSIBLE when findBySlug throws error', async () => {
      vi.spyOn(categoryRepository, 'findBySlug').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await useCase.getBySlug(slug);

      expect(result).toEqual({
        ok: false,
        message: 'Não foi possível buscar a categoria',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });
  });
});
