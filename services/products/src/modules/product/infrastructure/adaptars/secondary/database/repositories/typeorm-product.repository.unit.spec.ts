import { IDConstants } from '@product/domain/values-objects/constants';
import { ProductFactory } from '@product/infrastructure/helpers/factories/product-factory';
import {
  And,
  ArrayContains,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import ProductModel from '../models/product.model';
import { PaymentTypes } from '@product/domain/enums/payments-types.enum';
import { ProductFilters } from '@product/domain/ports/application/product/get-products.port';
import TypeOrmProductRepository from './typeorm-product.repository';

describe('TypeOrmProductRepository', () => {
  let repository: TypeOrmProductRepository;
  let productRepository: Repository<ProductModel>;

  beforeEach(() => {
    productRepository = {
      findOne: vi.fn(),
      find: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
      createQueryBuilder: vi.fn(),
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
    const mockQueryBuilder = {
      select: vi.fn(),
      where: vi.fn(),
      leftJoin: vi.fn(),
      addSelect: vi.fn(),
      getRawAndEntities: vi.fn(),
    } as any;

    beforeEach(() => {
      vi.spyOn(productRepository, 'createQueryBuilder').mockReturnValue(
        mockQueryBuilder,
      );
      mockQueryBuilder.select.mockReturnThis();
      mockQueryBuilder.where.mockReturnThis();
      mockQueryBuilder.leftJoin.mockReturnThis();
      mockQueryBuilder.addSelect.mockReturnThis();
    });

    const publicID = 'test-public-id';
    const userID = 'test-user-id';

    const mockProduct: ProductModel = ProductFactory.createModel();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...mockProductWithoutID } = mockProduct;

    it('should return product with isFavorited true when user has favorited', async () => {
      const mockResult = {
        entities: [mockProductWithoutID],
        raw: [{ isFavorited: true }],
      };

      mockQueryBuilder.getRawAndEntities.mockResolvedValue(mockResult);

      const result = await repository.getOne(publicID, userID);

      expect(productRepository.createQueryBuilder).toHaveBeenCalledWith(
        'product',
      );
      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'product.active = :active AND product.publicID = :publicID',
        { active: true, publicID: publicID },
      );
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith(
        'product_favorites',
        'favorite',
        'favorite.product_id = product.public_id AND favorite.user_id = :userID',
        { userID },
      );
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith(
        'CASE WHEN favorite.id IS NOT NULL THEN true ELSE false END',
        'isFavorited',
      );
      expect(mockQueryBuilder.getRawAndEntities).toHaveBeenCalled();

      expect(result).toEqual({
        ...mockProductWithoutID,
        isFavorited: true,
      });
    });

    it('should return product with isFavorited false when user has not favorited', async () => {
      const mockResult = {
        entities: [mockProductWithoutID],
        raw: [{ isFavorited: false }],
      };

      mockQueryBuilder.getRawAndEntities.mockResolvedValue(mockResult);

      const result = await repository.getOne(publicID, userID);

      expect(result).toEqual({
        ...mockProductWithoutID,
        isFavorited: false,
      });
    });

    it('should return null when product is not found', async () => {
      const mockResult = {
        entities: [],
        raw: [],
      };

      mockQueryBuilder.getRawAndEntities.mockResolvedValue(mockResult);

      const result = await repository.getOne(publicID, userID);

      expect(result).toBe(null);
    });

    it('should handle inactive products correctly', async () => {
      const mockResult = {
        entities: [],
        raw: [],
      };

      mockQueryBuilder.getRawAndEntities.mockResolvedValue(mockResult);

      const result = await repository.getOne('inactive-id', userID);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'product.active = :active AND product.publicID = :publicID',
        { active: true, publicID: 'inactive-id' },
      );
      expect(result).toBe(null);
    });

    it('should return products with all properties except id', async () => {
      const mockResult = {
        entities: [mockProductWithoutID],
        raw: [{ isFavorited: false }],
      };

      mockQueryBuilder.getRawAndEntities.mockResolvedValue(mockResult);
      const result = await repository.getOne('inactive-id', userID);

      expect(result).not.toHaveProperty('id');
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
          active: true,
          price: And(MoreThanOrEqual(1000), LessThanOrEqual(5000)),
        },
        select: [
          'publicID',
          'title',
          'price',
          'overview',
          'description',
          'photos',
          'payments',
          'active',
          'stock',
          'owner',
          'categoryID',
          'category',
          'createdAt',
          'updatedAt',
        ],
      });
    });

    it('should filter by stock range', async () => {
      const filters: ProductFilters = {
        stock: { min: 10, max: 100 },
      };

      await repository.findWithFilters(filters);

      expect(productRepository.find).toHaveBeenCalledWith({
        where: {
          active: true,
          stock: And(MoreThanOrEqual(10), LessThanOrEqual(100)),
        },
        select: [
          'publicID',
          'title',
          'price',
          'overview',
          'description',
          'photos',
          'payments',
          'active',
          'stock',
          'owner',
          'categoryID',
          'category',
          'createdAt',
          'updatedAt',
        ],
      });
    });

    it('should filter by payments array', async () => {
      const filters: ProductFilters = {
        payments: [PaymentTypes.PIX, PaymentTypes.CREDIT_CARD],
      };

      await repository.findWithFilters(filters);

      expect(productRepository.find).toHaveBeenCalledWith({
        where: {
          active: true,
          payments: ArrayContains([PaymentTypes.PIX, PaymentTypes.CREDIT_CARD]),
        },
        select: [
          'publicID',
          'title',
          'price',
          'overview',
          'description',
          'photos',
          'payments',
          'active',
          'stock',
          'owner',
          'categoryID',
          'category',
          'createdAt',
          'updatedAt',
        ],
      });
    });

    it('should filter by category array', async () => {
      const filters: ProductFilters = {
        categoryID: ['electronics'],
      };

      await repository.findWithFilters(filters);

      expect(productRepository.find).toHaveBeenCalledWith({
        where: {
          active: true,
          categoryID: In(['electronics']),
        },
        select: [
          'publicID',
          'title',
          'price',
          'overview',
          'description',
          'photos',
          'payments',
          'active',
          'stock',
          'owner',
          'categoryID',
          'category',
          'createdAt',
          'updatedAt',
        ],
      });
    });

    it('should filter by all available filters', async () => {
      const filters: ProductFilters = {
        price: { min: 1000, max: 5000 },
        stock: { min: 10, max: 100 },
        payments: [PaymentTypes.PIX, PaymentTypes.CREDIT_CARD],
        categoryID: ['electronics'],
      };

      await repository.findWithFilters(filters);

      expect(productRepository.find).toHaveBeenCalledWith({
        where: {
          categoryID: In(['electronics']),
          active: true,
          price: And(MoreThanOrEqual(1000), LessThanOrEqual(5000)),
          stock: And(MoreThanOrEqual(10), LessThanOrEqual(100)),
          payments: ArrayContains([PaymentTypes.PIX, PaymentTypes.CREDIT_CARD]),
        },
        select: [
          'publicID',
          'title',
          'price',
          'overview',
          'description',
          'photos',
          'payments',
          'active',
          'stock',
          'owner',
          'categoryID',
          'category',
          'createdAt',
          'updatedAt',
        ],
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

      expect(callArgs.select).toEqual([
        'publicID',
        'title',
        'price',
        'overview',
        'description',
        'photos',
        'payments',
        'active',
        'stock',
        'owner',
        'categoryID',
        'category',
        'createdAt',
        'updatedAt',
      ]);
    });

    it('should handle undefined category filter', async () => {
      const filters: ProductFilters = {
        categoryID: ['electronics'],
        price: { min: 1000, max: 5000 },
      };

      await repository.findWithFilters(filters);

      // Category não deve aparecer no where pois não está implementado
      expect(productRepository.find).toHaveBeenCalledWith({
        where: {
          active: true,
          categoryID: In(['electronics']),
          price: And(MoreThanOrEqual(1000), LessThanOrEqual(5000)),
        },
        select: [
          'publicID',
          'title',
          'price',
          'overview',
          'description',
          'photos',
          'payments',
          'active',
          'stock',
          'owner',
          'categoryID',
          'category',
          'createdAt',
          'updatedAt',
        ],
      });
    });

    it('should only apply implemented filters', async () => {
      const filters: ProductFilters = {
        categoryID: ['electronics', 'smartphones'], // Não implementado
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
