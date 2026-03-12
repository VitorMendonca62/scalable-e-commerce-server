import { IDConstants } from '@product/domain/values-objects/constants';
import { ProductFactory } from '@product/infrastructure/helpers/factories/product-factory';
import {
  And,
  ArrayContains,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import ProductModel from '../models/product.model';
import TypeOrmProductRepository from './typeorm-product.repository';
import { PaymentTypes } from '@product/domain/enums/payments-types.enum';
import { ProductFilters } from '@product/domain/ports/application/get-products.port';

describe('TypeOrmProductRepository', () => {
  let repository: TypeOrmProductRepository;
  let productRepository: Repository<ProductModel>;

  beforeEach(() => {
    productRepository = {
      findOne: vi.fn(),
      find: vi.fn(),
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

  describe('findWithFilters', () => {
    const mockProducts = [
      ProductFactory.createModel(),
      ProductFactory.createModel({ title: 'Product 2' }),
    ];

    beforeEach(() => {
      vi.spyOn(productRepository, 'find').mockResolvedValue(mockProducts);
    });

    it('should filter by price range', async () => {
      const filters: ProductFilters = {
        price: { min: 1000, max: 5000 },
      };

      await repository.findWithFilters(filters);

      expect(productRepository.find).toHaveBeenCalledWith({
        where: {
          price: And(MoreThanOrEqual(1000), LessThanOrEqual(5000)),
        },
        select: { id: false },
      });
    });

    it('should filter by stock range', async () => {
      const filters: ProductFilters = {
        stock: { min: 10, max: 100 },
      };

      await repository.findWithFilters(filters);

      expect(productRepository.find).toHaveBeenCalledWith({
        where: {
          stock: And(MoreThanOrEqual(10), LessThanOrEqual(100)),
        },
        select: { id: false },
      });
    });

    it('should filter by payments array', async () => {
      const filters: ProductFilters = {
        payments: [PaymentTypes.PIX, PaymentTypes.CREDIT_CARD],
      };

      await repository.findWithFilters(filters);

      expect(productRepository.find).toHaveBeenCalledWith({
        where: {
          payments: ArrayContains([PaymentTypes.PIX, PaymentTypes.CREDIT_CARD]),
        },
        select: { id: false },
      });
    });

    it('should filter by all available filters', async () => {
      const filters: ProductFilters = {
        price: { min: 1000, max: 5000 },
        stock: { min: 10, max: 100 },
        payments: [PaymentTypes.PIX, PaymentTypes.CREDIT_CARD],
      };

      await repository.findWithFilters(filters);

      expect(productRepository.find).toHaveBeenCalledWith({
        where: {
          price: And(MoreThanOrEqual(1000), LessThanOrEqual(5000)),
          stock: And(MoreThanOrEqual(10), LessThanOrEqual(100)),
          payments: ArrayContains([PaymentTypes.PIX, PaymentTypes.CREDIT_CARD]),
        },
        select: { id: false },
      });
    });

    it('should return products matching filters', async () => {
      const filters: ProductFilters = {
        price: { min: 1000, max: 5000 },
      };

      const result = await repository.findWithFilters(filters);

      expect(result).toEqual(mockProducts);
    });

    it('should return empty array when no products match', async () => {
      vi.spyOn(productRepository, 'find').mockResolvedValue([]);

      const filters: ProductFilters = {
        price: { min: 100000, max: 200000 },
      };

      const result = await repository.findWithFilters(filters);

      expect(result).toEqual([]);
    });

    it('should not include id in select', async () => {
      await repository.findWithFilters({});

      const callArgs = (productRepository.find as any).mock.calls[0][0];

      expect(callArgs.select).toEqual({ id: false });
    });

    it('should handle undefined category filter (not implemented)', async () => {
      const filters: ProductFilters = {
        category: ['electronics'],
        price: { min: 1000, max: 5000 },
      };

      await repository.findWithFilters(filters);

      // Category não deve aparecer no where pois não está implementado
      expect(productRepository.find).toHaveBeenCalledWith({
        where: {
          price: And(MoreThanOrEqual(1000), LessThanOrEqual(5000)),
        },
        select: { id: false },
      });
    });

    it('should only apply implemented filters', async () => {
      const filters: ProductFilters = {
        category: ['electronics', 'smartphones'], // Não implementado
        price: { min: 1000, max: 5000 },
        payments: [PaymentTypes.PIX],
        stock: { min: 10, max: 100 },
      };

      await repository.findWithFilters(filters);

      const callArgs = (productRepository.find as any).mock.calls[0][0];

      expect(callArgs.where).not.toHaveProperty('category');
      expect(callArgs.where).toHaveProperty('price');
      expect(callArgs.where).toHaveProperty('payments');
      expect(callArgs.where).toHaveProperty('stock');
    });

    it('should return products with all properties except id', async () => {
      const result = await repository.findWithFilters({
        price: { min: 1000, max: 5000 },
      });

      expect(result).toEqual(mockProducts);
      result.forEach((product) => {
        expect(product).toHaveProperty('publicID');
        expect(product).toHaveProperty('title');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('overview');
        expect(product).toHaveProperty('description');
        expect(product).toHaveProperty('photos');
        expect(product).toHaveProperty('payments');
        expect(product).toHaveProperty('active');
        expect(product).toHaveProperty('stock');
        expect(product).toHaveProperty('owner');
      });
    });
  });
});
