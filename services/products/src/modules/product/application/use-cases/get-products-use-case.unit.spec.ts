import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import { ProductFilters } from '@product/domain/ports/application/get-products.port';
import ProductRepository from '@product/domain/ports/secondary/product-repository.port';
import { ProductFactory } from '@product/infrastructure/helpers/factories/product-factory';
import GetProductsUseCase from './get-products-use-case';
import { PaymentTypes } from '@product/domain/enums/payments-types.enum';

describe('GetProductsUseCase', () => {
  let useCase: GetProductsUseCase;
  let productRepository: ProductRepository;

  beforeEach(async () => {
    productRepository = {
      findWithFilters: vi.fn(),
    } as any;

    useCase = new GetProductsUseCase(productRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(productRepository).toBeDefined();
  });

  describe('getByFilter', () => {
    const mockProducts = [
      ProductFactory.createModel(),
      ProductFactory.createModel({ title: 'Product 2' }),
      ProductFactory.createModel({ title: 'Product 3' }),
    ];

    beforeEach(() => {
      vi.spyOn(productRepository, 'findWithFilters').mockResolvedValue(
        mockProducts,
      );
    });

    it('should call productRepository.findWithFilters with correct filters', async () => {
      const filters: ProductFilters = {
        categoryID: ['electronics', 'smartphones'],
        price: { min: 1000, max: 5000 },
        payments: [PaymentTypes.PIX, PaymentTypes.CREDIT_CARD],
        stock: { min: 10, max: 100 },
      };

      await useCase.getByFilter(filters);

      expect(productRepository.findWithFilters).toHaveBeenCalledWith(filters);
    });

    it('should return ok with products on success', async () => {
      const filters: ProductFilters = {
        categoryID: ['electronics'],
      };

      const result = await useCase.getByFilter(filters);

      expect(result).toEqual({
        ok: true,
        result: mockProducts,
      });
    });

    it('should return empty array when no products match filters', async () => {
      vi.spyOn(productRepository, 'findWithFilters').mockResolvedValue([]);

      const filters: ProductFilters = {
        categoryID: ['nonexistent'],
      };

      const result = await useCase.getByFilter(filters);

      expect(result).toEqual({
        ok: true,
        result: [],
      });
    });

    it('should handle filter with only category', async () => {
      const filters: ProductFilters = {
        categoryID: ['electronics', 'smartphones'],
      };

      await useCase.getByFilter(filters);

      expect(productRepository.findWithFilters).toHaveBeenCalledWith(filters);
    });

    it('should handle filter with only price', async () => {
      const filters: ProductFilters = {
        price: { min: 1000, max: 5000 },
      };

      await useCase.getByFilter(filters);

      expect(productRepository.findWithFilters).toHaveBeenCalledWith(filters);
    });

    it('should handle filter with only payments', async () => {
      const filters: ProductFilters = {
        payments: [PaymentTypes.PIX, PaymentTypes.CREDIT_CARD],
      };

      await useCase.getByFilter(filters);

      expect(productRepository.findWithFilters).toHaveBeenCalledWith(filters);
    });

    it('should handle filter with only stock', async () => {
      const filters: ProductFilters = {
        stock: { min: 10, max: 100 },
      };

      await useCase.getByFilter(filters);

      expect(productRepository.findWithFilters).toHaveBeenCalledWith(filters);
    });

    it('should handle filter with multiple categories', async () => {
      const filters: ProductFilters = {
        categoryID: ['electronics', 'smartphones', 'accessories'],
      };

      await useCase.getByFilter(filters);

      expect(productRepository.findWithFilters).toHaveBeenCalledWith(filters);
    });

    it('should handle filter with multiple payment methods', async () => {
      const filters: ProductFilters = {
        payments: [PaymentTypes.PIX, PaymentTypes.CREDIT_CARD],
      };

      await useCase.getByFilter(filters);

      expect(productRepository.findWithFilters).toHaveBeenCalledWith(filters);
    });

    it('should return NOT_POSSIBLE if productRepository.findWithFilters throws error', async () => {
      vi.spyOn(productRepository, 'findWithFilters').mockRejectedValue(
        new Error('Database error'),
      );

      const filters: ProductFilters = {
        categoryID: ['electronics'],
      };

      const result = await useCase.getByFilter(filters);

      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel pegar os produtos',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });

    it('should return products matching complex filters', async () => {
      const complexFilters: ProductFilters = {
        categoryID: ['electronics', 'smartphones'],
        price: { min: 1000, max: 5000 },
        payments: [PaymentTypes.PIX, PaymentTypes.CREDIT_CARD],
        stock: { min: 10, max: 100 },
      };

      const result = await useCase.getByFilter(complexFilters);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.result).toEqual(mockProducts);
      }
    });

    it('should preserve filter object structure when calling repository', async () => {
      const filters: ProductFilters = {
        categoryID: ['electronics'],
        price: { min: 1000, max: 5000 },
        payments: [PaymentTypes.PIX],
        stock: { min: 10, max: 100 },
      };

      await useCase.getByFilter(filters);

      const callArgs = (productRepository.findWithFilters as any).mock
        .calls[0][0];

      expect(callArgs).toEqual(filters);
      expect(callArgs.categoryID).toEqual(['electronics']);
      expect(callArgs.price).toEqual({ min: 1000, max: 5000 });
      expect(callArgs.payments).toEqual([PaymentTypes.PIX]);
      expect(callArgs.stock).toEqual({ min: 10, max: 100 });
    });
  });
});
