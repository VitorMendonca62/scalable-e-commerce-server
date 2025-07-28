import { UsernameValidator } from './username-validator';
import { UsernameConstants } from './username-constants';
import { FieldInvalid } from '../../ports/primary/http/errors.port';

describe('UsernameValidator', () => {
  it('should not throw error if username is valid', () => {
    const validUsername = UsernameConstants.EXEMPLE;
    expect(() => UsernameValidator.validate(validUsername)).not.toThrow();
  });

  it('should throw if value is empty', () => {
    expect(() => UsernameValidator.validate('')).toThrow(
      new FieldInvalid(UsernameConstants.ERROR_REQUIRED, 'username'),
    );
  });

  it('should throw if value is not a string', () => {
    expect(() => UsernameValidator.validate(123 as any)).toThrow(
      new FieldInvalid(UsernameConstants.ERROR_STRING, 'username'),
    );
  });

  it('should throw if value is shorter than MIN_LENGTH', () => {
    const shortUsername = 'ab';
    expect(() => UsernameValidator.validate(shortUsername)).toThrow(
      new FieldInvalid(UsernameConstants.ERROR_MIN_LENGTH, 'username'),
    );
  });

  it('should throw if value contains spaces', () => {
    const usernameWithSpaces = 'user name';
    expect(() => UsernameValidator.validate(usernameWithSpaces)).toThrow(
      new FieldInvalid(UsernameConstants.ERROR_NO_SPACES, 'username'),
    );
  });
});
