import { FieldInvalid } from '@auth/domain/ports/primary/http/errors.port';
import IDValidator from './id-validator';
import { IDConstants } from './id-constants';

describe('IDValidator', () => {
  it('should not throw an error for a valid UUID', () => {
    expect(() => IDValidator.validate(IDConstants.EXEMPLE)).not.toThrow();
  });

  it('should throw an error if the value is empty', () => {
    expect(() => IDValidator.validate('')).toThrow(
      new FieldInvalid(IDConstants.ERROR_REQUIRED, 'id'),
    );
  });

  it('should throw an error if the value is not a string', () => {
    const nonStringValue = 12345 as any;
    expect(() => IDValidator.validate(nonStringValue)).toThrow(
      new FieldInvalid(IDConstants.ERROR_STRING, 'id'),
    );
  });

  it('should throw an error if the value is not a valid UUID', () => {
    expect(() =>
      IDValidator.validate(IDConstants.ERROR_INVALID_EXEMPLE),
    ).toThrow(new FieldInvalid(IDConstants.ERROR_INVALID, 'id'));
  });
});
