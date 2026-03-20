/* eslint-disable @typescript-eslint/no-unused-vars */
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
import ProductRatingModel from '../models/rating.model';

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
      groupBy: vi.fn(),
      addGroupBy: vi.fn(),
    } as any;

    beforeEach(() => {
      vi.spyOn(productRepository, 'createQueryBuilder').mockReturnValue(
        mockQueryBuilder,
      );
      vi.spyOn(repository as any, 'addRatingSelect').mockReturnValue(
        mockQueryBuilder,
      );
      vi.spyOn(repository as any, 'addFavoritedSelect').mockReturnValue(
        mockQueryBuilder,
      );
      mockQueryBuilder.select.mockReturnThis();
      mockQueryBuilder.where.mockReturnThis();
      mockQueryBuilder.leftJoin.mockReturnThis();
      mockQueryBuilder.addSelect.mockReturnThis();
      mockQueryBuilder.groupBy.mockReturnThis();
      mockQueryBuilder.addGroupBy.mockReturnThis();
    });

    const publicID = 'test-public-id';
    const userID = 'test-user-id';

    const mockProduct: ProductModel = ProductFactory.createModel();

    const { id, categoryID, active, ...mockProductWithoutSameFields } =
      mockProduct;

    it('should return product with correct parameters', async () => {
      const mockResult = {
        entities: [mockProductWithoutSameFields],
        raw: [{ isFavorited: true, rating: 4.5 }],
      };

      mockQueryBuilder.getRawAndEntities.mockResolvedValue(mockResult);

      const result = await repository.getOne(publicID, userID);

      expect(productRepository.createQueryBuilder).toHaveBeenCalledWith(
        'product',
      );
      expect(mockQueryBuilder.select).toHaveBeenCalledWith([
        'product.publicID',
        'product.title',
        'product.price',
        'product.overview',
        'product.description',
        'product.photos',
        'product.payments',
        'product.stock',
        'product.owner',
        'product.category',
        'product.createdAt',
        'product.updatedAt',
      ]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'product.active = :active AND product.public_id = :publicID',
        { active: true, publicID: publicID },
      );
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith(
        'product.category',
        'category',
      );
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith([
        'category.publicID',
        'category.name',
      ]);
      expect((repository as any).addRatingSelect).toHaveBeenCalledWith(
        mockQueryBuilder,
      );
      expect((repository as any).addFavoritedSelect).toHaveBeenCalledWith(
        mockQueryBuilder,
        userID,
      );

      expect(mockQueryBuilder.getRawAndEntities).toHaveBeenCalled();

      expect(result).toEqual({
        ...mockProductWithoutSameFields,
        isFavorited: true,
        rating: 4.5,
      });
    });

    it('should return product with isFavorited true when user has not favorited', async () => {
      const mockResult = {
        entities: [mockProductWithoutSameFields],
        raw: [{ isFavorited: true, rating: 0 }],
      };

      mockQueryBuilder.getRawAndEntities.mockResolvedValue(mockResult);

      const result = await repository.getOne(publicID, userID);

      expect(result).toEqual({
        ...mockProductWithoutSameFields,
        isFavorited: true,
        rating: 0,
      });
    });

    it('should return product with isFavorited false when user has not favorited', async () => {
      const mockResult = {
        entities: [mockProductWithoutSameFields],
        raw: [{ isFavorited: false, rating: 0 }],
      };

      mockQueryBuilder.getRawAndEntities.mockResolvedValue(mockResult);

      const result = await repository.getOne(publicID, userID);

      expect(result).toEqual({
        ...mockProductWithoutSameFields,
        isFavorited: false,
        rating: 0,
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

    it('should return products with all properties except id, active,categoryOD', async () => {
      const mockResult = {
        entities: [mockProductWithoutSameFields],
        raw: [{ isFavorited: false, rating: 0 }],
      };

      mockQueryBuilder.getRawAndEntities.mockResolvedValue(mockResult);
      const result = await repository.getOne('inactive-id', userID);

      expect(result).not.toHaveProperty('id');
      expect(result).not.toHaveProperty('categoryID');
      expect(result).not.toHaveProperty('active');
      expect(result).toHaveProperty('publicID');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('price');
      expect(result).toHaveProperty('overview');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('photos');
      expect(result).toHaveProperty('payments');
      expect(result).toHaveProperty('owner');
      expect(result).toHaveProperty('stock');
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
      expect(result).toHaveProperty('rating');
      expect(result).toHaveProperty('isFavorited');
    });

    it('should return category product with publicID, name', async () => {
      const { id, active, createdAt, updatedAt, products, ...category } =
        mockProductWithoutSameFields.category;

      const mockResult = {
        entities: [{ ...mockProductWithoutSameFields, category }],
        raw: [{ isFavorited: false, rating: 0 }],
      };

      mockQueryBuilder.getRawAndEntities.mockResolvedValue(mockResult);
      const result = await repository.getOne('inactive-id', userID);

      expect(result.category).not.toHaveProperty('id');
      expect(result.category).not.toHaveProperty('active');
      expect(result.category).not.toHaveProperty('createdAt');
      expect(result.category).not.toHaveProperty('updatedAt');
      expect(result.category).not.toHaveProperty('products');
      expect(result.category).toHaveProperty('publicID');
      expect(result.category).toHaveProperty('name');
    });

    it('should return products with all properties except id, active,categoryOD', async () => {
      const mockResult = {
        entities: [mockProductWithoutSameFields],
        raw: [{ isFavorited: false, rating: 0 }],
      };

      mockQueryBuilder.getRawAndEntities.mockResolvedValue(mockResult);
      const result = await repository.getOne('inactive-id', userID);

      expect(result).not.toHaveProperty('id');
      expect(result).not.toHaveProperty('categoryID');
      expect(result).not.toHaveProperty('active');
      expect(result).toHaveProperty('publicID');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('price');
      expect(result).toHaveProperty('overview');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('photos');
      expect(result).toHaveProperty('payments');
      expect(result).toHaveProperty('owner');
      expect(result).toHaveProperty('stock');
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
      expect(result).toHaveProperty('rating');
      expect(result).toHaveProperty('isFavorited');
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

    const mockQueryBuilder = {
      setFindOptions: vi.fn(),
      addSelect: vi.fn(),
      getRawAndEntities: vi.fn(),
      leftJoin: vi.fn(),
    } as any;

    beforeEach(() => {
      vi.spyOn(productRepository, 'createQueryBuilder').mockReturnValue(
        mockQueryBuilder,
      );
      vi.spyOn(repository as any, 'addRatingSelect').mockReturnValue(
        mockQueryBuilder,
      );
      mockQueryBuilder.setFindOptions.mockReturnThis();
      mockQueryBuilder.addSelect.mockReturnThis();
      mockQueryBuilder.leftJoin.mockReturnThis();
      mockQueryBuilder.getRawAndEntities.mockResolvedValue({
        entities: mockProducts,
        raw: [{ rating: 4.2 }, { rating: 3.7 }],
      });
    });

    it('should filter by all available filters and call with correct parameters', async () => {
      const filters: ProductFilters = {
        price: { min: 1000, max: 5000 },
        stock: { min: 10, max: 100 },
        payments: [PaymentTypes.PIX, PaymentTypes.CREDIT_CARD],
        categoryID: ['electronics'],
      };

      await repository.findWithFilters(filters);

      expect((repository as any).addRatingSelect).toHaveBeenCalledWith(
        mockQueryBuilder,
      );
      expect(mockQueryBuilder.setFindOptions).toHaveBeenCalledWith({
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
          'photos',
          'payments',
          'stock',
          'owner',
          'category',
          'createdAt',
          'updatedAt',
        ],
      });

      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith(
        'product.category',
        'category',
      );
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith([
        'category.publicID',
        'category.name',
      ]);
      expect(mockQueryBuilder.getRawAndEntities).toHaveBeenCalled();
    });

    it('should filter by price range', async () => {
      const filters: ProductFilters = {
        price: { min: 1000, max: 5000 },
      };

      await repository.findWithFilters(filters);

      expect(mockQueryBuilder.setFindOptions).toHaveBeenCalledWith({
        where: {
          active: true,
          price: And(MoreThanOrEqual(1000), LessThanOrEqual(5000)),
        },
        select: [
          'publicID',
          'title',
          'price',
          'overview',
          'photos',
          'payments',
          'stock',
          'owner',
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

      expect(mockQueryBuilder.setFindOptions).toHaveBeenCalledWith({
        where: {
          active: true,
          stock: And(MoreThanOrEqual(10), LessThanOrEqual(100)),
        },
        select: [
          'publicID',
          'title',
          'price',
          'overview',
          'photos',
          'payments',
          'stock',
          'owner',
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

      expect(mockQueryBuilder.setFindOptions).toHaveBeenCalledWith({
        where: {
          active: true,
          payments: ArrayContains([PaymentTypes.PIX, PaymentTypes.CREDIT_CARD]),
        },
        select: [
          'publicID',
          'title',
          'price',
          'overview',
          'photos',
          'payments',
          'stock',
          'owner',
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

      expect(mockQueryBuilder.setFindOptions).toHaveBeenCalledWith({
        where: {
          active: true,
          categoryID: In(['electronics']),
        },
        select: [
          'publicID',
          'title',
          'price',
          'overview',
          'photos',
          'payments',
          'stock',
          'owner',
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

      expect(result).toEqual([
        { ...mockProducts[0], rating: 4.2 },
        { ...mockProducts[1], rating: 3.7 },
      ]);
    });

    it('should return empty array when no products match', async () => {
      mockQueryBuilder.getRawAndEntities.mockResolvedValue({
        entities: [],
        raw: [],
      });

      const filters: ProductFilters = {
        price: { min: 100000, max: 200000 },
      };

      const result = await repository.findWithFilters(filters);

      expect(result).toEqual([]);
    });

    it('should return rating 0 when no have rating', async () => {
      mockQueryBuilder.getRawAndEntities.mockResolvedValue({
        entities: mockProducts,
        raw: [],
      });

      const filters: ProductFilters = {
        price: { min: 100000, max: 200000 },
      };

      const result = await repository.findWithFilters(filters);

      expect(result[0].rating).toEqual(0);
      expect(result[1].rating).toEqual(0);
    });

    it('should return products with all properties except description. active', async () => {
      const {
        id,
        categoryID,
        active,
        description,
        ...mockFirstProductWithoutSameFields
      } = mockProducts[0];
      const {
        id: _,
        categoryID: __,
        active: ___,
        description: ____,
        ...mockSecondProductWithoutSameFields
      } = mockProducts[1];

      mockQueryBuilder.getRawAndEntities.mockResolvedValue({
        entities: [
          mockFirstProductWithoutSameFields,
          mockSecondProductWithoutSameFields,
        ],
        raw: [{ rating: 4.2 }, { rating: 3.7 }],
      });
      mockQueryBuilder.getRawAndEntities();
      const result = await repository.findWithFilters({
        price: { min: 1000, max: 5000 },
      });

      expect(result).toEqual([
        {
          ...mockFirstProductWithoutSameFields,
          rating: 4.2,
        },
        {
          ...mockSecondProductWithoutSameFields,
          rating: 3.7,
        },
      ]);
      result.forEach((product) => {
        expect(product).not.toHaveProperty('id');
        expect(product).not.toHaveProperty('description');
        expect(product).not.toHaveProperty('active');
        expect(product).not.toHaveProperty('categoryID');
        expect(product).toHaveProperty('publicID');
        expect(product).toHaveProperty('category');
        expect(product).toHaveProperty('title');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('overview');
        expect(product).toHaveProperty('photos');
        expect(product).toHaveProperty('payments');
        expect(product).toHaveProperty('owner');
        expect(product).toHaveProperty('stock');
        expect(product).toHaveProperty('category');
        expect(product).toHaveProperty('createdAt');
        expect(product).toHaveProperty('updatedAt');
        expect(product).toHaveProperty('rating');
      });
    });
  });

  describe('addRatingSelect', () => {
    const mockQueryBuilder = {
      addSelect: vi.fn(),
      leftJoin: vi.fn(),
    } as any;

    const userID = IDConstants.EXEMPLE;

    beforeEach(() => {
      mockQueryBuilder.addSelect.mockReturnThis();
      mockQueryBuilder.leftJoin.mockReturnThis();
    });

    it('should call all functions with correct parameters', () => {
      (repository as any).addFavoritedSelect(mockQueryBuilder, userID);

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
    });

    it('should return new query with adicional informations', () => {
      const result = (repository as any).addFavoritedSelect(
        mockQueryBuilder,
        userID,
      );

      expect(result).toEqual(mockQueryBuilder);
    });
  });

  describe('addRatingSelect', () => {
    const mockQueryBuilder = {
      addSelect: vi.fn(),
      leftJoin: vi.fn(),
      groupBy: vi.fn(),
      addGroupBy: vi.fn(),
    } as any;

    beforeEach(() => {
      mockQueryBuilder.addSelect.mockReturnThis();
      mockQueryBuilder.leftJoin.mockReturnThis();
      mockQueryBuilder.groupBy.mockReturnThis();
      mockQueryBuilder.addGroupBy.mockReturnThis();
    });

    it('should call all functions with correct parameters', () => {
      (repository as any).addRatingSelect(mockQueryBuilder);

      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith(
        ProductRatingModel,
        'rating',
        'rating.product_id = product.public_id',
      );
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith(
        'COALESCE(AVG(rating.value), 0)',
        'rating',
      );
      expect(mockQueryBuilder.groupBy).toHaveBeenCalledWith('product.id');
      expect(mockQueryBuilder.addGroupBy).toHaveBeenNthCalledWith(
        1,
        'category.id',
      );
      expect(mockQueryBuilder.addGroupBy).toHaveBeenNthCalledWith(
        2,
        'favorite.id',
      );
    });

    it('should return new query with adicional informations', () => {
      const result = (repository as any).addRatingSelect(mockQueryBuilder);

      expect(result).toEqual(mockQueryBuilder);
    });
  });
});
