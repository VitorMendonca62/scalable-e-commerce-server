// TODO Sera válido apenas do BRASIL

import { FieldInvalid } from '@modules/user2/domain/ports/primary/http/error.port';
import { PostalCodeConstants } from './postal-code-constants';
import { PostalCodeValidator } from './postal-code-validator';

describe('PostalCodeValidator', () => {
  it('should not throw if postal code is valid with hyphen', () => {
    const validPostalCode = PostalCodeConstants.EXEMPLE;

    expect(() => PostalCodeValidator.validate(validPostalCode)).not.toThrow();
  });

  it('should not throw if postal code is valid without hyphen', () => {
    const validPostalCodes = ['01310100', '20040020', '90460100'];

    validPostalCodes.forEach((postalCode) => {
      expect(() => PostalCodeValidator.validate(postalCode)).not.toThrow();
    });
  });

  it('should throw if postal code is empty', () => {
    expect(() => PostalCodeValidator.validate('')).toThrow(
      new FieldInvalid(PostalCodeConstants.ERROR_REQUIRED, 'postalCode'),
    );
  });

  it('should throw if postal code is not a string', () => {
    expect(() => PostalCodeValidator.validate(123 as any)).toThrow(
      new FieldInvalid(PostalCodeConstants.ERROR_STRING, 'postalCode'),
    );
  });

  it('should throw if postal code length is different ', () => {
    const shortPostalCode = PostalCodeConstants.ERROR_LENGTH_EXEMPLE;

    expect(() => PostalCodeValidator.validate(shortPostalCode)).toThrow(
      new FieldInvalid(PostalCodeConstants.ERROR_LENGTH, 'postalCode'),
    );
  });

  it('should throw if postal code has invalid format', () => {
    const invalidPostalCodes = [
      '12345-67',
      '1234-5678',
      '123456-78',
      '12345-6789',
      'abc12-345',
      '12345-abc',
    ];

    invalidPostalCodes.forEach((postalCode) => {
      expect(() => PostalCodeValidator.validate(postalCode)).toThrow(
        new FieldInvalid(PostalCodeConstants.ERROR_INVALID, 'postalCode'),
      );
    });
  });
});
