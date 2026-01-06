import { UsernameValidator } from './username-validator';
import { UsernameConstants } from './username-constants';
import { FieldInvalid } from '@user/domain/ports/primary/http/error.port';

describe('UsernameValidator', () => {
  it('should not throw error if username is valid', () => {
    const validUsername = UsernameConstants.EXEMPLE;
    expect(() => UsernameValidator.validate(validUsername, true)).not.toThrow();
  });

  it('should dont throw if value is empty and field is optional', () => {
    expect(() =>
      UsernameValidator.validate(
        UsernameConstants.ERROR_REQUIRED_EXEMPLE,
        false,
      ),
    ).not.toThrow();
  });

  it('should throw if value is empty and field is required', () => {
    expect(() =>
      UsernameValidator.validate(
        UsernameConstants.ERROR_REQUIRED_EXEMPLE,
        true,
      ),
    ).toThrow(new FieldInvalid(UsernameConstants.ERROR_REQUIRED, 'username'));
  });

  it('should throw if value is not a string', () => {
    expect(() =>
      UsernameValidator.validate(
        UsernameConstants.ERROR_STRING_EXEMPLE as any,
        true,
      ),
    ).toThrow(new FieldInvalid(UsernameConstants.ERROR_STRING, 'username'));
  });

  it('should throw if valueis not a string and field is optional', () => {
    expect(() =>
      UsernameValidator.validate(
        UsernameConstants.ERROR_STRING_EXEMPLE as any,
        false,
      ),
    ).toThrow(new FieldInvalid(UsernameConstants.ERROR_STRING, 'username'));
  });

  it('should throw if value is shorter than MIN_LENGTH', () => {
    expect(() =>
      UsernameValidator.validate(
        UsernameConstants.ERROR_MIN_LENGTH_EXEMPLE,
        true,
      ),
    ).toThrow(new FieldInvalid(UsernameConstants.ERROR_MIN_LENGTH, 'username'));
  });

  it('should throw if value contains spaces', () => {
    expect(() =>
      UsernameValidator.validate(
        UsernameConstants.ERROR_NO_SPACES_EXEMPLE,
        true,
      ),
    ).toThrow(new FieldInvalid(UsernameConstants.ERROR_NO_SPACES, 'username'));
  });
});
