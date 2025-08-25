import { FieldInvalid } from '@modules/user2/domain/ports/primary/http/error.port';
import { CityConstants } from './city-constants';
import { CityValidator } from './city-validator';

describe('CityValidator', () => {
  it('should not throw if city is valid', () => {
    const validCity = CityConstants.EXEMPLE;

    expect(() => CityValidator.validate(validCity)).not.toThrow();
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
    expect(() => CityValidator.validate('')).toThrow(
      new FieldInvalid(CityConstants.ERROR_REQUIRED, 'city'),
    );
  });

  it('should throw if city is not a string', () => {
    expect(() => CityValidator.validate(123 as any)).toThrow(
      new FieldInvalid(CityConstants.ERROR_STRING, 'city'),
    );
  });

  it('should throw if city is too short', () => {
    const shortCity = CityConstants.ERROR_TOO_SHORT_EXEMPLE;

    expect(() => CityValidator.validate(shortCity)).toThrow(
      new FieldInvalid(CityConstants.ERROR_TOO_SHORT, 'city'),
    );
  });

  it('should throw if city is too long', () => {
    const longCity = CityConstants.ERROR_TOO_LONG_EXEMPLE;

    expect(() => CityValidator.validate(longCity)).toThrow(
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
