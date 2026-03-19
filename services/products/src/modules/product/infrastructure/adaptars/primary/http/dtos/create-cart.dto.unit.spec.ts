import { ValidationObjectFactory } from '@product/infrastructure/helpers/dto-helper';
import { CartDTOFactory } from '@product/infrastructure/helpers/factories/cart-factory';

describe('CreateCartDTO', () => {
  it('should success validation when all fields are valid', async () => {
    const errors = await ValidationObjectFactory.validateObject(
      CartDTOFactory.createCreateCartDTO(),
    );

    expect(errors).toHaveLength(0);
  });

  it('should return error when items is undefined', async () => {
    const dto = CartDTOFactory.createCreateCartDTO({}, 'items');

    const errors = await ValidationObjectFactory.validateObject(dto);

    expect(errors.length).toBeGreaterThan(0);
    const fieldError = errors.find((err) => err.property === 'items');
    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.isArray).toBe('Items deve ser um array');
  });

  it('should return error when items is not an array', async () => {
    const dto = CartDTOFactory.createCreateCartDTO({
      items: 'invalid' as any,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);

    expect(errors.length).toBeGreaterThan(0);
    const fieldError = errors.find((err) => err.property === 'items');
    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.isArray).toBe('Items deve ser um array');
  });

  it('should return error when item productID is invalid', async () => {
    const dto = CartDTOFactory.createCreateCartDTO({
      items: [
        CartDTOFactory.createCartItemDTO({
          productID: 'not-a-uuid',
        }),
      ],
    });

    const errors = await ValidationObjectFactory.validateObject(dto);

    expect(errors.length).toBeGreaterThan(0);
    const fieldError = errors.find((err) => err.property === 'items');
    expect(fieldError).toBeDefined();

    const itemError = fieldError?.children?.[0]?.children?.[0];
    expect(itemError?.property).toBe('productID');
    expect(itemError?.constraints?.isUuid).toBe(
      'O ID do produto deve ser um UUID válido',
    );
  });

  it('should return error when item quantity is less than 1', async () => {
    const dto = CartDTOFactory.createCreateCartDTO({
      items: [
        CartDTOFactory.createCartItemDTO({
          quantity: 0,
        }),
      ],
    });

    const errors = await ValidationObjectFactory.validateObject(dto);

    expect(errors.length).toBeGreaterThan(0);
    const fieldError = errors.find((err) => err.property === 'items');
    expect(fieldError).toBeDefined();

    const itemError = fieldError?.children?.[0]?.children?.[0];
    expect(itemError?.property).toBe('quantity');
    expect(itemError?.constraints?.min).toBe(
      'A quantidade deve ser no mínimo 1',
    );
  });
});
