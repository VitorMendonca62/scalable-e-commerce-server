import { NameValidator } from './name-validator';
import { NameConstants } from './name-constants';
import { FieldInvalid } from '@user/domain/ports/primary/http/error.port';

describe('NameValidator', () => {
  it('should not throw if name is valid', () => {
    expect(() =>
      NameValidator.validate(NameConstants.EXEMPLE, true),
    ).not.toThrow();
  });

  it('should dont throw if value is empty and field is optional', () => {
    expect(() =>
      NameValidator.validate(NameConstants.ERROR_REQUIRED_EXEMPLE, false),
    ).not.toThrow();
  });

  it('should throw if name is empty', () => {
    expect(() =>
      NameValidator.validate(NameConstants.ERROR_REQUIRED_EXEMPLE, true),
    ).toThrow(new FieldInvalid(NameConstants.ERROR_REQUIRED, 'name'));
  });

  it('should throw if name is not a string', () => {
    expect(() =>
      NameValidator.validate(NameConstants.ERROR_STRING_EXEMPLE as any, true),
    ).toThrow(new FieldInvalid(NameConstants.ERROR_STRING, 'name'));
  });

  it('should throw if value is not a string and field is optional', () => {
    expect(() =>
      NameValidator.validate(NameConstants.ERROR_STRING_EXEMPLE as any, false),
    ).toThrow(new FieldInvalid(NameConstants.ERROR_STRING, 'name'));
  });

  it('should throw if name has less than MIN_LENGTH characters', () => {
    expect(() =>
      NameValidator.validate(NameConstants.MIN_LENGTH_EXEMPLE, true),
    ).toThrow(new FieldInvalid(NameConstants.ERROR_MIN_LENGTH, 'name'));
  });
});
