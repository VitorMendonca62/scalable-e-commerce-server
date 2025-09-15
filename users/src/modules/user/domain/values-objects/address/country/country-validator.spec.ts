import { FieldInvalid } from '@user/domain/ports/primary/http/error.port';
import { CountryConstants } from './country-constants';
import { CountryValidator } from './country-validator';

describe('CountryValidator', () => {
  it('should not throw if country is valid', () => {
    expect(() => CountryValidator.validate(CountryConstants.EXEMPLE)).not.toThrow();
  });

  it('should not throw for valid countries with special characters', () => {
    const validCountries = [
      'Brasil',
      'Estados Unidos',
      'Costa Rica',
      "Côte d'Ivoire",
      'São Tomé e Príncipe',
    ];

    validCountries.forEach((country) => {
      expect(() => CountryValidator.validate(country)).not.toThrow();
    });
  });

  it('should throw if country is empty', () => {
    expect(() => CountryValidator.validate(CountryConstants.ERROR_REQUIRED_EXEMPLE)).toThrow(
      new FieldInvalid(CountryConstants.ERROR_REQUIRED, 'country'),
    );
  });

  it('should throw if country is not a string', () => {
    expect(() => CountryValidator.validate(CountryConstants.ERROR_STRING_EXEMPLE as any)).toThrow(
      new FieldInvalid(CountryConstants.ERROR_STRING, 'country'),
    );
  });

  it('should throw if country is too short', () => {
    expect(() => CountryValidator.validate(CountryConstants.ERROR_TOO_SHORT_EXEMPLE)).toThrow(
      new FieldInvalid(CountryConstants.ERROR_TOO_SHORT, 'country'),
    );
  });

  it('should throw if country is too long', () => {
    expect(() => CountryValidator.validate(CountryConstants.ERROR_TOO_LONG_EXEMPLE)).toThrow(
      new FieldInvalid(CountryConstants.ERROR_TOO_LONG, 'country'),
    );
  });

  it('should throw if country contains invalid characters', () => {
    const invalidCountries = [
      'Brasil123',
      'Country@',
      'Test#Country',
      'Invalid$Country',
    ];

    invalidCountries.forEach((country) => {
      expect(() => CountryValidator.validate(country)).toThrow(
        new FieldInvalid(CountryConstants.ERROR_INVALID, 'country'),
      );
    });
  });
});
