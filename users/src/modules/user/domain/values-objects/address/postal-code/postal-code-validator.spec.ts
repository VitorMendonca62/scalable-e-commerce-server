// TODO Sera válido apenas do BRASIL

import { FieldInvalid } from '@user/domain/ports/primary/http/error.port';
import { PostalCodeConstants } from './postal-code-constants';
import { PostalCodeValidator } from './postal-code-validator';

describe('PostalCodeValidator', () => {
  it('should not throw if postal code is valid', () => {
    expect(() => PostalCodeValidator.validate(PostalCodeConstants.EXEMPLE)).not.toThrow();
  });

  it('should throw if postal code is empty', () => {
    expect(() => PostalCodeValidator.validate(PostalCodeConstants.ERROR_REQUIRED_EXEMPLE)).toThrow(
      new FieldInvalid(PostalCodeConstants.ERROR_REQUIRED, 'postalCode'),
    );
  });

  it('should throw if postal code is not a string', () => {
    expect(() => PostalCodeValidator.validate(PostalCodeConstants.ERROR_STRING_EXEMPLE as any)).toThrow(
      new FieldInvalid(PostalCodeConstants.ERROR_STRING, 'postalCode'),
    );
  });

  it('should throw if postal code length is different ', () => {
    expect(() => PostalCodeValidator.validate(PostalCodeConstants.ERROR_LENGTH_EXEMPLE)).toThrow(
      new FieldInvalid(PostalCodeConstants.ERROR_LENGTH, 'postalCode'),
    );
  });
});
