import { IDConstants } from '@product/domain/values-objects/constants';
import { ProductFactory } from '@product/infrastructure/helpers/factories/product-factory';
import { Repository } from 'typeorm';
import ProductModel from '../models/product.model';
import TypeOrmProductRepository from './typeorm-product.repository';
import { PaymentTypes } from '@product/domain/enums/payments-types.enum';

describe('TypeOrmProductRepository', () => {
  let repository: TypeOrmProductRepository;
  let productRepository: Repository<ProductModel>;

  beforeEach(() => {
    productRepository = {
      findOne: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
    } as any;

    repository = new TypeOrmProductRepository(productRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
    expect(productRepository).toBeDefined();
  });

  describe('add', () => {
    const product = ProductFactory.createModel({
      updatedAt: undefined,
      id: undefined,
      createdAt: undefined,
    });

    it('should call save with correct parameters', async () => {
      await repository.add(product);

      expect(productRepository.save).toHaveBeenCalledWith(product);
    });

    it('should save product successfully', async () => {
      vi.spyOn(productRepository, 'save').mockResolvedValue(product);

      await repository.add(product);

      expect(productRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should handle save with inactive product', async () => {
      const inactiveProduct = {
        ...product,
        active: false,
        stock: 0,
      };

      await repository.add(inactiveProduct);

      expect(productRepository.save).toHaveBeenCalledWith(inactiveProduct);
    });
  });

  describe('getOne', () => {
    const productModel = ProductFactory.createModel();

    beforeEach(() => {
      vi.spyOn(productRepository, 'findOne').mockResolvedValue(productModel);
    });

    it('should call findOne with publicID field', async () => {
      const publicID = IDConstants.EXEMPLE;

      await repository.getOne({ publicID });

      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { publicID },
        select: { id: false },
      });
    });

    it('should call findOne with id field', async () => {
      const id = 'database-id';

      await repository.getOne({ id });

      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        select: { id: false },
      });
    });

    it('should call findOne with both id and publicID', async () => {
      const id = 'database-id';
      const publicID = IDConstants.EXEMPLE;

      await repository.getOne({ id, publicID });

      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id, publicID },
        select: { id: false },
      });
    });

    it('should return product when found', async () => {
      const result = await repository.getOne({ publicID: IDConstants.EXEMPLE });

      expect(result).toEqual(productModel);
    });

    it('should return null when product is not found', async () => {
      vi.spyOn(productRepository, 'findOne').mockResolvedValue(null);

      const result = await repository.getOne({ publicID: 'non-existent-id' });

      expect(result).toBeNull();
    });

    it('should return correct product details when found', async () => {
      const customProduct = ProductFactory.createModel({
        title: 'Found Product',
        price: 15000,
        stock: 50,
      });

      vi.spyOn(productRepository, 'findOne').mockResolvedValue(customProduct);

      const result = await repository.getOne({ publicID: IDConstants.EXEMPLE });

      expect(result).toEqual(customProduct);
      expect(result?.title).toBe('Found Product');
      expect(result?.price).toBe(15000);
      expect(result?.stock).toBe(50);
    });

    it('should handle empty fields object', async () => {
      await repository.getOne({});

      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: {},
        select: { id: false },
      });
    });

    it('should return product model with all properties', async () => {
      const result = await repository.getOne({ publicID: IDConstants.EXEMPLE });

      expect(result).toHaveProperty('publicID');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('price');
      expect(result).toHaveProperty('overview');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('photos');
      expect(result).toHaveProperty('payments');
      expect(result).toHaveProperty('active');
      expect(result).toHaveProperty('stock');
      expect(result).toHaveProperty('owner');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });
  });

  describe('update', () => {
    const productID = IDConstants.EXEMPLE;
    const userID = 'owner-user-id';
    const updates: Partial<ProductModel> = {
      title: 'Updated Title',
      price: 15000,
      stock: 100,
    };

    beforeEach(() => {
      vi.spyOn(productRepository, 'update').mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      });
    });

    it('should call update with correct where clause and updates', async () => {
      await repository.update(productID, userID, updates);

      expect(productRepository.update).toHaveBeenCalledWith(
        { publicID: productID, owner: userID },
        updates,
      );
    });

    it('should return true when product is updated successfully (affected = 1)', async () => {
      const result = await repository.update(productID, userID, updates);

      expect(result).toBe(true);
    });

    it('should return true when multiple products are affected (affected > 1)', async () => {
      vi.spyOn(productRepository, 'update').mockResolvedValue({
        affected: 3,
        raw: {},
        generatedMaps: [],
      });

      const result = await repository.update(productID, userID, updates);

      expect(result).toBe(true);
    });

    it('should return false when no product is found (affected = 0)', async () => {
      vi.spyOn(productRepository, 'update').mockResolvedValue({
        affected: 0,
        raw: {},
        generatedMaps: [],
      });

      const result = await repository.update(productID, userID, updates);

      expect(result).toBe(false);
    });

    it('should return false when affected is undefined', async () => {
      vi.spyOn(productRepository, 'update').mockResolvedValue({
        affected: undefined,
        raw: {},
        generatedMaps: [],
      });

      const result = await repository.update(productID, userID, updates);

      expect(result).toBe(false);
    });

    it('should return false when product exists but user is not the owner', async () => {
      vi.spyOn(productRepository, 'update').mockResolvedValue({
        affected: 0,
        raw: {},
        generatedMaps: [],
      });

      const differentUserID = 'different-user-id';
      const result = await repository.update(
        productID,
        differentUserID,
        updates,
      );

      expect(productRepository.update).toHaveBeenCalledWith(
        { publicID: productID, owner: differentUserID },
        updates,
      );
      expect(result).toBe(false);
    });

    it('should handle partial updates with single field', async () => {
      const singleFieldUpdate: Partial<ProductModel> = {
        title: 'New Title',
      };

      await repository.update(productID, userID, singleFieldUpdate);

      expect(productRepository.update).toHaveBeenCalledWith(
        { publicID: productID, owner: userID },
        singleFieldUpdate,
      );
    });

    it('should handle updates with only price', async () => {
      const priceUpdate: Partial<ProductModel> = {
        price: 9999,
      };

      await repository.update(productID, userID, priceUpdate);

      expect(productRepository.update).toHaveBeenCalledWith(
        { publicID: productID, owner: userID },
        priceUpdate,
      );
    });

    it('should handle updates with only stock', async () => {
      const stockUpdate: Partial<ProductModel> = {
        stock: 0,
      };

      await repository.update(productID, userID, stockUpdate);

      expect(productRepository.update).toHaveBeenCalledWith(
        { publicID: productID, owner: userID },
        stockUpdate,
      );
    });

    it('should handle updates with only active status', async () => {
      const activeUpdate: Partial<ProductModel> = {
        active: false,
      };

      await repository.update(productID, userID, activeUpdate);

      expect(productRepository.update).toHaveBeenCalledWith(
        { publicID: productID, owner: userID },
        activeUpdate,
      );
    });

    it('should handle updates with multiple fields', async () => {
      const multipleUpdates: Partial<ProductModel> = {
        title: 'Updated Title',
        price: 20000,
        description: 'Updated description',
        overview: 'Updated overview',
        stock: 50,
        active: true,
      };

      await repository.update(productID, userID, multipleUpdates);

      expect(productRepository.update).toHaveBeenCalledWith(
        { publicID: productID, owner: userID },
        multipleUpdates,
      );
    });

    it('should handle updates with photos array', async () => {
      const photosUpdate: Partial<ProductModel> = {
        photos: [
          'https://example.com/photo1.jpg',
          'https://example.com/photo2.jpg',
        ],
      };

      await repository.update(productID, userID, photosUpdate);

      expect(productRepository.update).toHaveBeenCalledWith(
        { publicID: productID, owner: userID },
        photosUpdate,
      );
    });

    it('should handle updates with payments array', async () => {
      const paymentsUpdate: Partial<ProductModel> = {
        payments: [PaymentTypes.BILLET],
      };

      await repository.update(productID, userID, paymentsUpdate);

      expect(productRepository.update).toHaveBeenCalledWith(
        { publicID: productID, owner: userID },
        paymentsUpdate,
      );
    });

    it('should handle empty updates object', async () => {
      const emptyUpdate: Partial<ProductModel> = {};

      await repository.update(productID, userID, emptyUpdate);

      expect(productRepository.update).toHaveBeenCalledWith(
        { publicID: productID, owner: userID },
        emptyUpdate,
      );
    });

    it('should verify both publicID and owner in where clause', async () => {
      await repository.update(productID, userID, updates);

      const callArgs = (productRepository.update as any).mock.calls[0];
      const whereClause = callArgs[0];

      expect(whereClause).toHaveProperty('publicID', productID);
      expect(whereClause).toHaveProperty('owner', userID);
    });

    it('should handle updates with description and overview', async () => {
      const textUpdates: Partial<ProductModel> = {
        description: 'New detailed description with more information',
        overview: 'New brief overview',
      };

      await repository.update(productID, userID, textUpdates);

      expect(productRepository.update).toHaveBeenCalledWith(
        { publicID: productID, owner: userID },
        textUpdates,
      );
    });
  });
});
