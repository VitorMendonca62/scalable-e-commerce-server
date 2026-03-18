import { IDConstants } from '@product/domain/values-objects/constants';
import { CartFactory } from '@product/infrastructure/helpers/factories/cart-factory';
import { Repository } from 'typeorm';
import CartModel from '../models/cart.model';
import TypeOrmCartRepository from './typeorm-cart.repository';

describe('TypeOrmCartRepository', () => {
  let repository: TypeOrmCartRepository;
  let cartRepository: Repository<CartModel>;

  beforeEach(() => {
    cartRepository = {
      save: vi.fn(),
      findOne: vi.fn(),
      find: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as any;

    repository = new TypeOrmCartRepository(cartRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
    expect(cartRepository).toBeDefined();
  });

  describe('add', () => {
    const cartEntity = CartFactory.createEntity();
    const newCart = {
      publicID: cartEntity.publicID,
      userID: cartEntity.userID,
      items: cartEntity.items,
    };

    beforeEach(() => {
      vi.spyOn(cartRepository, 'save').mockResolvedValue(
        CartFactory.createModel() as CartModel,
      );
    });

    it('should call save with correct parameters', async () => {
      await repository.add(newCart);

      expect(cartRepository.save).toHaveBeenCalledWith(newCart);
    });

    it('should save cart successfully', async () => {
      await repository.add(newCart);

      expect(cartRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should return void', async () => {
      const result = await repository.add(newCart);

      expect(result).toBeUndefined();
    });

    it('should not include id, createdAt, or updatedAt', async () => {
      await repository.add(newCart);

      const savedCart = (cartRepository.save as any).mock.calls[0][0];

      expect(savedCart).not.toHaveProperty('id');
      expect(savedCart).not.toHaveProperty('createdAt');
      expect(savedCart).not.toHaveProperty('updatedAt');
    });
  });

  describe('getOne', () => {
    const cartEntity = CartFactory.createEntity();
    const cartID = cartEntity.publicID;
    const userID = cartEntity.userID;
    const cartModel = CartFactory.createModel({
      publicID: cartID,
      userID,
      items: cartEntity.items,
    });
    const cart = {
      publicID: cartModel.publicID,
      items: cartModel.items,
      createdAt: cartModel.createdAt,
      updatedAt: cartModel.updatedAt,
    };

    beforeEach(() => {
      vi.spyOn(cartRepository, 'findOne').mockResolvedValue(cart as any);
    });

    it('should call findOne with correct parameters', async () => {
      await repository.getOne(cartID, userID);

      expect(cartRepository.findOne).toHaveBeenCalledWith({
        where: { publicID: cartID, userID },
        select: ['publicID', 'items', 'createdAt', 'updatedAt'],
      });
    });

    it('should return cart when found', async () => {
      const result = await repository.getOne(cartID, userID);

      expect(result).toEqual(cart);
    });

    it('should return null when cart is not found', async () => {
      vi.spyOn(cartRepository, 'findOne').mockResolvedValue(null);

      const result = await repository.getOne(cartID, userID);

      expect(result).toBeNull();
    });

    it('should not include id, createdAt, or updatedAt', async () => {
      const result = await repository.getOne(cartID, userID);

      expect(result).toHaveProperty('publicID');
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });
  });

  describe('findByUser', () => {
    const userID = IDConstants.EXEMPLE;
    const carts = [CartFactory.createModel(), CartFactory.createModel()].map(
      ({ publicID, items, createdAt, updatedAt }) => ({
        publicID,
        items,
        createdAt,
        updatedAt,
      }),
    );

    beforeEach(() => {
      vi.spyOn(cartRepository, 'find').mockResolvedValue(carts as any[]);
    });

    it('should call find with correct parameters', async () => {
      await repository.findByUser(userID);

      expect(cartRepository.find).toHaveBeenCalledWith({
        where: { userID },
        select: ['publicID', 'userID', 'items', 'createdAt', 'updatedAt'],
        order: { createdAt: 'DESC' },
      });
    });

    it('should return carts when found', async () => {
      const result = await repository.findByUser(userID);

      expect(result).toEqual(carts);
    });

    it('should return empty array when no carts found', async () => {
      vi.spyOn(cartRepository, 'find').mockResolvedValue([]);

      const result = await repository.findByUser(userID);

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    const cartID = IDConstants.EXEMPLE;
    const userID = IDConstants.EXEMPLE;
    const updates = {
      items: [CartFactory.createItem({ quantity: 2 })],
    };

    beforeEach(() => {
      vi.spyOn(cartRepository, 'update').mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      });
    });

    it('should call update with correct parameters', async () => {
      await repository.update(cartID, userID, updates);

      expect(cartRepository.update).toHaveBeenCalledWith(
        { publicID: cartID, userID },
        updates,
      );
    });

    it('should return true when affected is at least 1', async () => {
      const result = await repository.update(cartID, userID, updates);

      expect(result).toBe(true);
    });

    it('should return false when affected is 0', async () => {
      vi.spyOn(cartRepository, 'update').mockResolvedValue({
        affected: 0,
        raw: {},
        generatedMaps: [],
      });

      const result = await repository.update(cartID, userID, updates);

      expect(result).toBe(false);
    });

    it('should return false when affected is undefined', async () => {
      vi.spyOn(cartRepository, 'update').mockResolvedValue({
        affected: undefined,
        raw: {},
        generatedMaps: [],
      });

      const result = await repository.update(cartID, userID, updates);

      expect(result).toBe(false);
    });
  });

  describe('delete', () => {
    const cartID = IDConstants.EXEMPLE;
    const userID = IDConstants.EXEMPLE;

    beforeEach(() => {
      vi.spyOn(cartRepository, 'delete').mockResolvedValue({
        affected: 1,
        raw: {},
      });
    });

    it('should call delete with correct parameters', async () => {
      await repository.delete(cartID, userID);

      expect(cartRepository.delete).toHaveBeenCalledWith({
        publicID: cartID,
        userID,
      });
    });

    it('should return true when affected is at least 1', async () => {
      const result = await repository.delete(cartID, userID);

      expect(result).toBe(true);
    });

    it('should return false when affected is 0', async () => {
      vi.spyOn(cartRepository, 'delete').mockResolvedValue({
        affected: 0,
        raw: {},
      });

      const result = await repository.delete(cartID, userID);

      expect(result).toBe(false);
    });

    it('should return false when affected is undefined', async () => {
      vi.spyOn(cartRepository, 'delete').mockResolvedValue({
        affected: undefined,
        raw: {},
      });

      const result = await repository.delete(cartID, userID);

      expect(result).toBe(false);
    });
  });
});
