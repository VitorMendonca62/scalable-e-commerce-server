import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import ProductRepository from '@product/domain/ports/secondary/product-repository.port';
import { ProductFactory } from '@product/infrastructure/helpers/factories/product-factory';
import ProductMapper from '@product/infrastructure/mappers/product.mapper';
import CreateProductUseCase from './create-product-use-case';

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;
  let productRepository: ProductRepository;
  let productMapper: ProductMapper;

  beforeEach(async () => {
    productRepository = {
      add: vi.fn(),
    } as any;

    productMapper = {
      entityForModel: vi.fn(),
    } as any;

    useCase = new CreateProductUseCase(productRepository, productMapper);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(productRepository).toBeDefined();
    expect(productMapper).toBeDefined();
  });

  describe('execute', () => {
    const productEntity = ProductFactory.createEntity();
    const productModel = ProductFactory.createModel();

    beforeEach(() => {
      vi.spyOn(productMapper, 'entityForModel').mockReturnValue(productModel);
      vi.spyOn(productRepository, 'add').mockResolvedValue(undefined);
    });

    it('should call productMapper.entityForModel with product entity', async () => {
      await useCase.execute(productEntity);

      expect(productMapper.entityForModel).toHaveBeenCalledWith(productEntity);
    });

    it('should call productRepository.add with mapped model', async () => {
      await useCase.execute(productEntity);

      expect(productRepository.add).toHaveBeenCalledWith(productModel);
    });

    it('should return ok on success', async () => {
      const result = await useCase.execute(productEntity);

      expect(result).toEqual({
        ok: true,
      });
    });

    it('should return NOT_POSSIBLE if productRepository.add throws error', async () => {
      vi.spyOn(productRepository, 'add').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await useCase.execute(productEntity);

      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel criar o produto',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });

    it('should return NOT_POSSIBLE if productMapper.entityForModel throws error', async () => {
      vi.spyOn(productMapper, 'entityForModel').mockImplementation(() => {
        throw new Error('Mapping error');
      });

      const result = await useCase.execute(productEntity);

      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel criar o produto',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });

    it('should handle network errors', async () => {
      vi.spyOn(productRepository, 'add').mockRejectedValue(
        new Error('Network timeout'),
      );

      const result = await useCase.execute(productEntity);

      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel criar o produto',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });
  });
});
