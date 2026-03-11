import { IDConstants } from '@product/domain/values-objects/constants';
import { ProductFactory } from '@product/infrastructure/helpers/factories/product-factory';
import { Repository } from 'typeorm';
import ProductModel from '../models/product.model';
import TypeOrmProductRepository from './typeorm-product.repository';

describe('TypeOrmProductRepository', () => {
  let repository: TypeOrmProductRepository;
  let productRepository: Repository<ProductModel>;

  beforeEach(() => {
    productRepository = {
      findOne: vi.fn(),
      save: vi.fn(),
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
});
