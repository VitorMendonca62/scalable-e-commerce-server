import { ValidationObjectFactory } from '@product/infrastructure/helpers/dto-helper';
import { CartDTOFactory } from '@product/infrastructure/helpers/factories/cart-factory';

describe('UpdateCartDTO', () => {
  it('should success validation when all fields are undefined (partial update)', async () => {
    const errors = await ValidationObjectFactory.validateObject(
      CartDTOFactory.createUpdateCartDTO(),
    );

    expect(errors).toHaveLength(0);
  });

  it('should success validation when items is valid', async () => {
    const errors = await ValidationObjectFactory.validateObject(
      CartDTOFactory.createUpdateCartDTO({
        items: [CartDTOFactory.createCartItemDTO()],
      }),
    );

    expect(errors).toHaveLength(0);
  });

  it('should return error when items is not an array', async () => {
    const errors = await ValidationObjectFactory.validateObject(
      CartDTOFactory.createUpdateCartDTO({
        items: 'invalid' as any,
      }),
    );

    expect(errors.length).toBeGreaterThan(0);
    const fieldError = errors.find((err) => err.property === 'items');
    expect(fieldError).toBeDefined();
  });

  it('should return error when items contains invalid productID', async () => {
    const errors = await ValidationObjectFactory.validateObject(
      CartDTOFactory.createUpdateCartDTO({
        items: [
          CartDTOFactory.createCartItemDTO({
            productID: 'invalid',
          }),
        ],
      }),
    );

    expect(errors.length).toBeGreaterThan(0);
    const fieldError = errors.find((err) => err.property === 'items');
    expect(fieldError).toBeDefined();
  });
});