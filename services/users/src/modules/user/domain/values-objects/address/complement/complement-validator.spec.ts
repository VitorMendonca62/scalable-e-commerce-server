import { FieldInvalid } from '@user/domain/ports/primary/http/error.port';
import { ComplementConstants } from './complement-constants';
import { ComplementValidator } from './complement-validator';

describe('ComplementValidator', () => {
  it('should not throw if complement is valid', () => {
    expect(() => ComplementValidator.validate(ComplementConstants.EXEMPLE)).not.toThrow();
  });

  it('should not throw if complement is null', () => {
    expect(() => ComplementValidator.validate(null)).not.toThrow();
  });

  it('should not throw if complement is undefined', () => {
    expect(() => ComplementValidator.validate(undefined)).not.toThrow();
  });

  it('should not throw if complement is empty string', () => {
    expect(() => ComplementValidator.validate('')).not.toThrow();
  });

  it('should not throw for valid complements with special characters', () => {
    const validComplements = [
      'Apto 101',
      'Sala 205',
      'Casa 2',
      'Bloco A, Apto 15',
      'Loja 10',
      'Andar 3º',
    ];

    validComplements.forEach((complement) => {
      expect(() => ComplementValidator.validate(complement)).not.toThrow();
    });
  });

  it('should throw if complement is not a string', () => {
    expect(() => ComplementValidator.validate(ComplementConstants.ERROR_STRING_EXEMPLE as any)).toThrow(
      new FieldInvalid(ComplementConstants.ERROR_STRING, 'complement'),
    );
  });

  it('should throw if complement is too long', () => {
    expect(() => ComplementValidator.validate(ComplementConstants.ERROR_TOO_LONG_EXEMPLE)).toThrow(
      new FieldInvalid(ComplementConstants.ERROR_TOO_LONG, 'complement'),
    );
  });

  it('should throw if complement contains invalid characters', () => {
    const invalidComplements = ['Apto@101', 'Sala#205', 'Casa$2', 'Bloco&A'];

    invalidComplements.forEach((complement) => {
      expect(() => ComplementValidator.validate(complement)).toThrow(
        new FieldInvalid(ComplementConstants.ERROR_INVALID, 'complement'),
      );
    });
  });
});
