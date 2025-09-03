import { NameValidator } from './name-validator';
import { NameConstants } from './name-constants';
import { FieldInvalid } from '@user/domain/ports/primary/http/error.port';

describe('NameValidator', () => {
  it('should not throw if name is valid', () => {
    const validName = NameConstants.EXEMPLE;

    expect(() => NameValidator.validate(validName)).not.toThrow();
  });

  it('should throw if name is empty', () => {
    expect(() => NameValidator.validate('')).toThrowError(
      new FieldInvalid(NameConstants.ERROR_REQUIRED, 'name'),
    );
  });

  it('should throw if name is not a string', () => {
    expect(() => NameValidator.validate(123 as any)).toThrow(
      new FieldInvalid(NameConstants.ERROR_STRING, 'name'),
    );
  });

  it('should throw if name has less than MIN_LENGTH characters', () => {
    const shortName = 'A';

    expect(() => NameValidator.validate(shortName)).toThrow(
      new FieldInvalid(NameConstants.ERROR_MIN_LENGTH, 'name'),
    );
  });
});
