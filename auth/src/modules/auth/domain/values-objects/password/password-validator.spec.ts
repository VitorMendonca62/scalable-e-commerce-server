import PasswordValidator from './password-validator';
import { PasswordConstants } from './password-constants';
import { FieldInvalid } from '../../ports/primary/http/errors.port';

describe('PasswordValidator', () => {
  it('should not throw if password is valid and strong', () => {
    const password = PasswordConstants.EXEMPLE;

    expect(() => PasswordValidator.validate(password)).not.toThrow();
  });

  it('should throw if password is empty', () => {
    expect(() => PasswordValidator.validate('')).toThrow(
      new FieldInvalid(PasswordConstants.ERROR_REQUIRED, 'password'),
    );
  });

  it('should throw if password is not a string', () => {
    expect(() => PasswordValidator.validate(12345678 as any)).toThrow(
      new FieldInvalid(PasswordConstants.ERROR_STRING, 'password'),
    );
  });

  it('should throw if password is too short', () => {
    const shortPassword = 'aB1@';

    expect(() => PasswordValidator.validate(shortPassword)).toThrow(
      new FieldInvalid(PasswordConstants.ERROR_MIN_LENGTH, 'password'),
    );
  });

  it('should throw if password is weak and strong check is enabled', () => {
    const weakPassword = PasswordConstants.WEAK_EXEMPLE;

    expect(() => PasswordValidator.validate(weakPassword)).toThrow(
      new FieldInvalid(PasswordConstants.ERROR_WEAK_PASSWORD, 'password'),
    );
  });
});
