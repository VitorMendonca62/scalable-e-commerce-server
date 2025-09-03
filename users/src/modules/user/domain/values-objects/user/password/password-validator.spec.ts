import { PasswordValidator } from './password-validator';
import { PasswordConstants } from './password-constants';
import { FieldInvalid } from '@user/domain/ports/primary/http/error.port';

describe('PasswordValidator', () => {
  it('should not throw if password is valid and strong', () => {
    const password = PasswordConstants.EXEMPLE;

    expect(() => PasswordValidator.validate(password, true)).not.toThrow();
  });

  it('should not throw if password is valid but strong check is disabled', () => {
    const password = 'simplepass';

    expect(() => PasswordValidator.validate(password, false)).not.toThrow();
  });

  it('should throw if password is empty', () => {
    expect(() => PasswordValidator.validate('', false)).toThrow(
      new FieldInvalid(PasswordConstants.ERROR_REQUIRED, 'password'),
    );
  });

  it('should throw if password is not a string', () => {
    expect(() => PasswordValidator.validate(12345678 as any, false)).toThrow(
      new FieldInvalid(PasswordConstants.ERROR_STRING, 'password'),
    );
  });

  it('should throw if password is too short', () => {
    const shortPassword = 'aB1@';

    expect(() => PasswordValidator.validate(shortPassword, false)).toThrow(
      new FieldInvalid(PasswordConstants.ERROR_MIN_LENGTH, 'password'),
    );
  });

  it('should throw if password is weak and strong check is enabled', () => {
    const weakPassword = PasswordConstants.WEAK_EXEMPLE;

    expect(() => PasswordValidator.validate(weakPassword, true)).toThrow(
      new FieldInvalid(PasswordConstants.ERROR_WEAK_PASSWORD, 'password'),
    );
  });
});
