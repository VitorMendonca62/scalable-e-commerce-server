import CartEntity from '@product/domain/entities/cart.entity';
import { IDConstants } from '@product/domain/values-objects/constants';
import { v7 } from 'uuid';
import CartMapper from './cart.mapper';

import { type Mock } from 'vitest';
import { CartDTOFactory, CartFactory } from '../helpers/factories/cart-factory';

vi.mock('uuid', () => {
  return { v7: vi.fn() };
});

describe('CartMapper', () => {
  let mapper: CartMapper;

  beforeEach(() => {
    mapper = new CartMapper();

    (v7 as Mock).mockReturnValue(`id-${IDConstants.EXEMPLE}`);
  });

  it('should be defined', () => {
    expect(mapper).toBeDefined();
  });

  describe('createDTOForEntity', () => {
    const dto = CartDTOFactory.createCreateCartDTO();
    const userID = IDConstants.EXEMPLE;

    it('should return CartEntity with correct types', () => {
      const entity = mapper.createDTOForEntity(dto, userID);

      expect(entity).toBeInstanceOf(CartEntity);
      expect(typeof entity.publicID).toBe('string');
      expect(typeof entity.userID).toBe('string');
      expect(Array.isArray(entity.items)).toBe(true);
    });

    it('should map fields from DTO and userID', () => {
      const entity = mapper.createDTOForEntity(dto, userID);

      expect(entity.userID).toBe(userID);
      expect(entity.items).toBe(dto.items);
    });

    it('should generate publicID using uuid v7', () => {
      const entity = mapper.createDTOForEntity(dto, userID);

      expect(entity.publicID).toBe(`id-${IDConstants.EXEMPLE}`);
    });
  });

  describe('entityForModel', () => {
    const cartEntity = CartFactory.createEntity();

    it('should return model object with correct fields', () => {
      const model = mapper.entityForModel(cartEntity);

      expect(model.publicID).toBe(cartEntity.publicID);
      expect(model.userID).toBe(cartEntity.userID);
      expect(model.items).toBe(cartEntity.items);
      expect(model).toEqual({
        publicID: cartEntity.publicID,
        userID: cartEntity.userID,
        items: cartEntity.items,
      });
    });

    it('should omit id, createdAt and updatedAt fields', () => {
      const model = mapper.entityForModel(cartEntity);

      expect(model).not.toHaveProperty('id');
      expect(model).not.toHaveProperty('createdAt');
      expect(model).not.toHaveProperty('updatedAt');
    });
  });

  describe('updateDTOToEntityPartial', () => {
    it('should return partial with items when provided', () => {
      const dto = CartDTOFactory.createUpdateCartDTO({
        items: [CartFactory.createItem({ quantity: 3 })],
      });

      const result = mapper.updateDTOToEntityPartial(dto);

      expect(result).toEqual({
        items: dto.items,
      });
    });

    it('should return empty object when no items are provided', () => {
      const dto = CartDTOFactory.createUpdateCartDTO({});

      const result = mapper.updateDTOToEntityPartial(dto);

      expect(result).toEqual({});
    });
  });
});
