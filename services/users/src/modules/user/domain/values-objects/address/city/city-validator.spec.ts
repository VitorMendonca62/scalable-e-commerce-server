import { FieldInvalid } from '@user/domain/ports/primary/http/error.port';
import { CityConstants } from './city-constants';
import { CityValidator } from './city-validator';

describe('CityValidator', () => {
  it('should not throw if city is valid', () => {
    expect(() => CityValidator.validate(CityConstants.EXEMPLE)).not.toThrow();
  });

  it('should not throw for valid cities with special characters', () => {
    const validCities = [
      'São Paulo',
      'Rio de Janeiro',
      'Belo Horizonte',
      'Salvador',
      'Fortaleza',
    ];

    validCities.forEach((city) => {
      expect(() => CityValidator.validate(city)).not.toThrow();
    });
  });

  it('should throw if city is empty', () => {
    expect(() => CityValidator.validate(CityConstants.ERROR_REQUIRED_EXEMPLE)).toThrow(
      new FieldInvalid(CityConstants.ERROR_REQUIRED, 'city'),
    );
  });

  it('should throw if city is not a string', () => {
    expect(() => CityValidator.validate(CityConstants.ERROR_STRING_EXEMPLE as any)).toThrow(
      new FieldInvalid(CityConstants.ERROR_STRING, 'city'),
    );
  });

  it('should throw if city is too short', () => {
    expect(() => CityValidator.validate(CityConstants.ERROR_TOO_SHORT_EXEMPLE)).toThrow(
      new FieldInvalid(CityConstants.ERROR_TOO_SHORT, 'city'),
    );
  });

  it('should throw if city is too long', () => {
    expect(() => CityValidator.validate(CityConstants.ERROR_TOO_LONG_EXEMPLE)).toThrow(
      new FieldInvalid(CityConstants.ERROR_TOO_LONG, 'city'),
    );
  });

  it('should throw if city contains invalid characters', () => {
    const invalidCities = [
      'São Paulo123',
      'City@',
      'Test#City',
      'Invalid$City',
    ];

    invalidCities.forEach((city) => {
      expect(() => CityValidator.validate(city)).toThrow(
        new FieldInvalid(CityConstants.ERROR_INVALID, 'city'),
      );
    });
  });
});
