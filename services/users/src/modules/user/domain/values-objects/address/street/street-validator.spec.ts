import { FieldInvalid } from '@user/domain/ports/primary/http/error.port';
import { StreetConstants } from './street-constants';
import { StreetValidator } from './street-validator';

describe('StreetValidator', () => {
  it('should not throw if street is valid', () => {
    expect(() => StreetValidator.validate(StreetConstants.EXEMPLE)).not.toThrow();
  });

  it('should not throw for valid streets with special characters', () => {
    const validStreets = [
      'Rua das Flores',
      'Avenida Paulista',
      'Travessa da Paz',
      'Alameda Santos',
      'Praça da Sé',
    ];

    validStreets.forEach((street) => {
      expect(() => StreetValidator.validate(street)).not.toThrow();
    });
  });

  it('should throw if street is empty', () => {
    expect(() => StreetValidator.validate(StreetConstants.ERROR_REQUIRED_EXEMPLE)).toThrow(
      new FieldInvalid(StreetConstants.ERROR_REQUIRED, 'street'),
    );
  });

  it('should throw if street is not a string', () => {
    expect(() => StreetValidator.validate(StreetConstants.ERROR_STRING_EXEMPLE as any)).toThrow(
      new FieldInvalid(StreetConstants.ERROR_STRING, 'street'),
    );
  });

  it('should throw if street is too short', () => {
    expect(() => StreetValidator.validate(StreetConstants.ERROR_TOO_SHORT_EXEMPLE)).toThrow(
      new FieldInvalid(StreetConstants.ERROR_TOO_SHORT, 'street'),
    );
  });

  it('should throw if street is too long', () => {
    expect(() => StreetValidator.validate(StreetConstants.ERROR_TOO_LONG_EXEMPLE)).toThrow(
      new FieldInvalid(StreetConstants.ERROR_TOO_LONG, 'street'),
    );
  });

  it('should throw if street contains invalid characters', () => {
    const invalidStreets = [
      'Rua das Flores123',
      'Street@',
      'Test#Street',
      'Invalid$Street',
    ];

    invalidStreets.forEach((street) => {
      expect(() => StreetValidator.validate(street)).toThrow(
        new FieldInvalid(StreetConstants.ERROR_INVALID, 'street'),
      );
    });
  });
});
