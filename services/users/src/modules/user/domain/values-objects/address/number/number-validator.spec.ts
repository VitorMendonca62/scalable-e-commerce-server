import { FieldInvalid } from '@user/domain/ports/primary/http/error.port';
import { NumberConstants } from './number-constants';
import { NumberValidator } from './number-validator';

describe('NumberValidator', () => {
  it('should not throw if number is valid', () => {
    expect(() => NumberValidator.validate(NumberConstants.EXEMPLE)).not.toThrow();
  });

  it('should throw if number is empty', () => {
    expect(() => NumberValidator.validate(NumberConstants.ERROR_REQUIRED_EXEMPLE)).toThrow(
      new FieldInvalid(NumberConstants.ERROR_REQUIRED, 'number'),
    );
  });

  it('should throw if number is not a string', () => {
    expect(() => NumberValidator.validate(NumberConstants.ERROR_STRING_EXEMPLE as any)).toThrow(
      new FieldInvalid(NumberConstants.ERROR_STRING, 'number'),
    );
  });
  
  it('should throw if number is too long', () => {
    expect(() => NumberValidator.validate(NumberConstants.ERROR_TOO_LONG_EXEMPLE)).toThrow(
      new FieldInvalid(NumberConstants.ERROR_TOO_LONG, 'number'),
    );
  });

  it('should throw if number contains invalid characters', () => {
    const invalidNumbers = [
      '123@',
      '456#',
      '789$',
      'ABC%',
      'Test!',
      'Invalid&',
    ];

    invalidNumbers.forEach((number) => {
      expect(() => NumberValidator.validate(number)).toThrow(
        new FieldInvalid(NumberConstants.ERROR_INVALID, 'number'),
      );
    });
  });
});
