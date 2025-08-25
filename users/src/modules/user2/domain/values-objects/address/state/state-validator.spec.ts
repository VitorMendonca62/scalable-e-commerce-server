import { FieldInvalid } from '@modules/user2/domain/ports/primary/http/error.port';
import { StateConstants } from './state-constants';
import { StateValidator } from './state-validator';

describe('StateValidator', () => {
  it('should not throw if state is valid', () => {
    const validState = StateConstants.EXEMPLE;

    expect(() => StateValidator.validate(validState)).not.toThrow();
  });

  it('should not throw for valid states with special characters', () => {
    const validStates = [
      'São Paulo',
      'Rio de Janeiro',
      'Minas Gerais',
      'Santa Catarina',
      'Rio Grande do Sul',
    ];

    validStates.forEach((state) => {
      expect(() => StateValidator.validate(state)).not.toThrow();
    });
  });

  it('should throw if state is empty', () => {
    expect(() => StateValidator.validate('')).toThrow(
      new FieldInvalid(StateConstants.ERROR_REQUIRED, 'state'),
    );
  });

  it('should throw if state is not a string', () => {
    expect(() => StateValidator.validate(123 as any)).toThrow(
      new FieldInvalid(StateConstants.ERROR_STRING, 'state'),
    );
  });

  it('should throw if state is too short', () => {
    const shortState = StateConstants.ERROR_TOO_SHORT_EXEMPLE;

    expect(() => StateValidator.validate(shortState)).toThrow(
      new FieldInvalid(StateConstants.ERROR_TOO_SHORT, 'state'),
    );
  });

  it('should throw if state is too long', () => {
    const longState = StateConstants.ERROR_TOO_LONG_EXEMPLE;

    expect(() => StateValidator.validate(longState)).toThrow(
      new FieldInvalid(StateConstants.ERROR_TOO_LONG, 'state'),
    );
  });

  it('should throw if state contains invalid characters', () => {
    const invalidStates = [
      'São Paulo123',
      'State@',
      'Test#State',
      'Invalid$State',
    ];

    invalidStates.forEach((state) => {
      expect(() => StateValidator.validate(state)).toThrow(
        new FieldInvalid(StateConstants.ERROR_INVALID, 'state'),
      );
    });
  });
});
