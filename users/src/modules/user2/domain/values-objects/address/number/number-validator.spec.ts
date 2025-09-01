import { FieldInvalid } from '@modules/user2/domain/ports/primary/http/error.port';
import { NumberConstants } from './number-constants';
import { NumberValidator } from './number-validator';

describe('NumberValidator', () => {
  it('should not throw if number is valid', () => {
    const validNumber = NumberConstants.EXEMPLE;

    expect(() => NumberValidator.validate(validNumber)).not.toThrow();
  });

  it('should not throw for valid numbers with special formats', () => {
    const validNumbers = [
      '123',
      '456A',
      '789-B',
      'S/N',
      '1234',
      'A1',
      '12.34',
    ];

    validNumbers.forEach((number) => {
      expect(() => NumberValidator.validate(number)).not.toThrow();
    });
  });

  it('should throw if number is empty', () => {
    expect(() => NumberValidator.validate('')).toThrow(
      new FieldInvalid(NumberConstants.ERROR_REQUIRED, 'number'),
    );
  });

  it('should throw if number is not a string', () => {
    expect(() => NumberValidator.validate(123 as any)).toThrow(
      new FieldInvalid(NumberConstants.ERROR_STRING, 'number'),
    );
  });

  it('should throw if number is too short', () => {
    const shortNumber = NumberConstants.ERROR_TOO_SHORT_EXEMPLE;

    expect(() => NumberValidator.validate(shortNumber)).toThrow(
      new FieldInvalid(NumberConstants.ERROR_TOO_SHORT, 'number'),
    );
  });

  it('should throw if number is too long', () => {
    const longNumber = NumberConstants.ERROR_TOO_LONG_EXEMPLE;

    expect(() => NumberValidator.validate(longNumber)).toThrow(
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
