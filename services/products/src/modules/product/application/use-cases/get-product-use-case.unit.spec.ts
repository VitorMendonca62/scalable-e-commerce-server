import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import ProductRepository from '@product/domain/ports/secondary/product-repository.port';
import { IDConstants } from '@product/domain/values-objects/constants';
import { ProductFactory } from '@product/infrastructure/helpers/factories/product-factory';
import GetProductUseCase from './get-product-use-case';

describe('GetProductUseCase', () => {
  let useCase: GetProductUseCase;
  let productRepository: ProductRepository;

  beforeEach(async () => {
    productRepository = {
      getOne: vi.fn(),
    } as any;

    useCase = new GetProductUseCase(productRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(productRepository).toBeDefined();
  });

  describe('getByID', () => {
    const productID = IDConstants.EXEMPLE;
    const productModel = ProductFactory.createModel();

    beforeEach(() => {
      vi.spyOn(productRepository, 'getOne').mockResolvedValue(productModel);
    });

    it('should call productRepository.getOne with correct parameters', async () => {
      await useCase.getByID(productID);

      expect(productRepository.getOne).toHaveBeenCalledWith({
        publicID: productID,
      });
    });

    it('should return ok with product on success', async () => {
      const result = await useCase.getByID(productID);

      expect(result).toEqual({
        ok: true,
        result: productModel,
      });
    });

    it('should return NOT_FOUND when product does not exist', async () => {
      vi.spyOn(productRepository, 'getOne').mockResolvedValue(null);

      const result = await useCase.getByID(productID);

      expect(result).toEqual({
        ok: false,
        reason: ApplicationResultReasons.NOT_FOUND,
        message: 'Não foi possivel encontrar o produto',
      });
    });

    it('should return NOT_POSSIBLE if productRepository.getOne throws error', async () => {
      vi.spyOn(productRepository, 'getOne').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await useCase.getByID(productID);

      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel pegar o produto',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });

    it('should return the correct product when found', async () => {
      const customProduct = ProductFactory.createModel({
        title: 'Custom Product',
        price: 9999,
        stock: 100,
      });

      vi.spyOn(productRepository, 'getOne').mockResolvedValue(customProduct);

      const result = await useCase.getByID(productID);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.result).toEqual(customProduct);
        expect(result.result.title).toBe('Custom Product');
        expect(result.result.price).toBe(9999);
        expect(result.result.stock).toBe(100);
      }
    });

    it('should handle multiple consecutive calls', async () => {
      await useCase.getByID(productID);
      await useCase.getByID(productID);
      await useCase.getByID(productID);

      expect(productRepository.getOne).toHaveBeenCalledTimes(3);
      expect(productRepository.getOne).toHaveBeenCalledWith({
        publicID: productID,
      });
    });
  });
});
