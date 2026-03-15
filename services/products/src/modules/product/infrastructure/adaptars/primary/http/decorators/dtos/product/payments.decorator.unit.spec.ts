import { PaymentTypes } from '@product/domain/enums/payments-types.enum';
import { PaymentsConstants } from '@product/domain/values-objects/constants';
import { ValidationObjectFactory } from '@product/infrastructure/helpers/dto-helper';
import { ProductDTOFactory } from '@product/infrastructure/helpers/factories/product-factory';

describe('Payments Decorator', () => {
  it('should success validation when payments is valid array', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      payments: PaymentsConstants.EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const paymentsError = errors.find((err) => err.property === 'payments');

    expect(paymentsError).toBeUndefined();
  });

  it('should return error when payments is not array', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      payments: PaymentsConstants.ERROR_ARRAY_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'payments');

    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.isArray).toBe(
      PaymentsConstants.ERROR_ARRAY,
    );
  });

  it('should return error when payments array is empty', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      payments: PaymentsConstants.ERROR_MIN_LENGTH_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'payments');

    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.arrayMinSize).toBe(
      PaymentsConstants.ERROR_MIN_LENGTH,
    );
  });

  it('should return error when payments contain invalid type', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      payments: PaymentsConstants.ERROR_INVALID_TYPE_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'payments');

    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.isEnum).toBe(
      PaymentsConstants.ERROR_INVALID_TYPE,
    );
  });

  it('should accept single payment method', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      payments: [PaymentTypes.PIX],
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'payments');

    expect(fieldError).toBeUndefined();
  });

  it('should accept multiple valid payment methods', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      payments: [
        PaymentTypes.PIX,
        PaymentTypes.CREDIT_CARD,
        PaymentTypes.DEBIT_CARD,
        PaymentTypes.BILLET,
      ],
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'payments');

    expect(fieldError).toBeUndefined();
  });

  it('should handle undefined payments', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({}, 'payments');

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'payments');

    expect(fieldError).toBeDefined();
  });
});
