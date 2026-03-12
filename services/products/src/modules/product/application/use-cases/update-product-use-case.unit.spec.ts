import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import ProductRepository from '@product/domain/ports/secondary/product-repository.port';
import { IDConstants } from '@product/domain/values-objects/constants';
import ProductModel from '@product/infrastructure/adaptars/secondary/database/models/product.model';
import UpdateProductUseCase from './update-product-use-case';
import { PaymentTypes } from '@product/domain/enums/payments-types.enum';

describe('UpdateProductUseCase', () => {
  let useCase: UpdateProductUseCase;
  let productRepository: ProductRepository;

  beforeEach(async () => {
    productRepository = {
      update: vi.fn(),
    } as any;

    useCase = new UpdateProductUseCase(productRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(productRepository).toBeDefined();
  });

  describe('execute', () => {
    const productID = IDConstants.EXEMPLE;
    const userID = IDConstants.EXEMPLE;
    const updates: Partial<ProductModel> = {
      title: 'Updated Product Title',
      price: 15000,
      stock: 100,
    };

    beforeEach(() => {
      vi.spyOn(productRepository, 'update').mockResolvedValue(true);
    });

    it('should call productRepository.update with correct parameters', async () => {
      await useCase.execute(productID, userID, updates);

      expect(productRepository.update).toHaveBeenCalledWith(
        productID,
        userID,
        updates,
      );
    });

    it('should return ok on success', async () => {
      const result = await useCase.execute(productID, userID, updates);

      expect(result).toEqual({
        ok: true,
      });
    });

    it('should return NOT_FOUND when product does not exist', async () => {
      vi.spyOn(productRepository, 'update').mockResolvedValue(false);

      const result = await useCase.execute(productID, userID, updates);

      expect(result).toEqual({
        ok: false,
        reason: ApplicationResultReasons.NOT_FOUND,
        message: 'Não foi possivel encontrar o produto',
      });
    });

    it('should return NOT_FOUND when user is not the owner', async () => {
      vi.spyOn(productRepository, 'update').mockResolvedValue(false);

      const differentUserID = 'different-user-id';
      const result = await useCase.execute(productID, differentUserID, updates);

      expect(result).toEqual({
        ok: false,
        reason: ApplicationResultReasons.NOT_FOUND,
        message: 'Não foi possivel encontrar o produto',
      });
    });

    it('should return NOT_POSSIBLE if productRepository.update throws error', async () => {
      vi.spyOn(productRepository, 'update').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await useCase.execute(productID, userID, updates);

      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel atualizar o produto',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });

    it('should handle partial updates with single field', async () => {
      const singleFieldUpdate: Partial<ProductModel> = {
        title: 'New Title Only',
      };

      await useCase.execute(productID, userID, singleFieldUpdate);

      expect(productRepository.update).toHaveBeenCalledWith(
        productID,
        userID,
        singleFieldUpdate,
      );
    });

    it('should handle updates with only price change', async () => {
      const priceUpdate: Partial<ProductModel> = {
        price: 9999,
      };

      await useCase.execute(productID, userID, priceUpdate);

      expect(productRepository.update).toHaveBeenCalledWith(
        productID,
        userID,
        priceUpdate,
      );
    });

    it('should handle updates with only stock change', async () => {
      const stockUpdate: Partial<ProductModel> = {
        stock: 0,
      };

      await useCase.execute(productID, userID, stockUpdate);

      expect(productRepository.update).toHaveBeenCalledWith(
        productID,
        userID,
        stockUpdate,
      );
    });

    it('should handle updates with only active status change', async () => {
      const activeUpdate: Partial<ProductModel> = {
        active: false,
      };

      await useCase.execute(productID, userID, activeUpdate);

      expect(productRepository.update).toHaveBeenCalledWith(
        productID,
        userID,
        activeUpdate,
      );
    });

    it('should handle updates with multiple fields', async () => {
      const multipleFieldsUpdate: Partial<ProductModel> = {
        title: 'Updated Title',
        price: 12000,
        description: 'Updated description',
        stock: 50,
        active: true,
      };

      await useCase.execute(productID, userID, multipleFieldsUpdate);

      expect(productRepository.update).toHaveBeenCalledWith(
        productID,
        userID,
        multipleFieldsUpdate,
      );
    });

    it('should handle updates with photos array', async () => {
      const photosUpdate: Partial<ProductModel> = {
        photos: [
          'https://example.com/new-photo1.jpg',
          'https://example.com/new-photo2.jpg',
        ],
      };

      await useCase.execute(productID, userID, photosUpdate);

      expect(productRepository.update).toHaveBeenCalledWith(
        productID,
        userID,
        photosUpdate,
      );
    });

    it('should handle updates with payments array', async () => {
      const paymentsUpdate: Partial<ProductModel> = {
        payments: [PaymentTypes.BILLET],
      };

      await useCase.execute(productID, userID, paymentsUpdate);

      expect(productRepository.update).toHaveBeenCalledWith(
        productID,
        userID,
        paymentsUpdate,
      );
    });

    it('should handle empty updates object', async () => {
      const emptyUpdate: Partial<ProductModel> = {};

      await useCase.execute(productID, userID, emptyUpdate);

      expect(productRepository.update).toHaveBeenCalledWith(
        productID,
        userID,
        emptyUpdate,
      );
    });

    it('should handle overview update', async () => {
      const overviewUpdate: Partial<ProductModel> = {
        overview: 'Updated product overview',
      };

      await useCase.execute(productID, userID, overviewUpdate);

      expect(productRepository.update).toHaveBeenCalledWith(
        productID,
        userID,
        overviewUpdate,
      );
    });

    it('should handle description update', async () => {
      const descriptionUpdate: Partial<ProductModel> = {
        description: 'Updated detailed product description',
      };

      await useCase.execute(productID, userID, descriptionUpdate);

      expect(productRepository.update).toHaveBeenCalledWith(
        productID,
        userID,
        descriptionUpdate,
      );
    });
  });
});
