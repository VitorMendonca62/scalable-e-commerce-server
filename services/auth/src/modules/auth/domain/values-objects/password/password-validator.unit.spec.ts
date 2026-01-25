import PasswordValidator from './password-validator';
import { PasswordConstants } from './password-constants';
import { FieldInvalid } from '../../ports/primary/http/errors.port';

describe('PasswordValidator', () => {
  it('should not throw if password is valid and strong', () => {
    const password = PasswordConstants.EXEMPLE;

    expect(() => PasswordValidator.validate(password)).not.toThrow();
  });

  it('should not throw if password is empyt', () => {
    const password = '';

    expect(() => PasswordValidator.validate(password)).not.toThrow();
  });

  it('should throw if password is not a string', () => {
    try {
      PasswordValidator.validate(12345678 as any);
      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error).toBeInstanceOf(FieldInvalid);
      expect(error.message).toBe(PasswordConstants.ERROR_STRING);
      expect(error.data).toBe('password');
    }
  });

  it('should throw if password is too short', () => {
    const shortPassword = 'aB1@';

    try {
      PasswordValidator.validate(shortPassword);

      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error).toBeInstanceOf(FieldInvalid);
      expect(error.message).toBe(PasswordConstants.ERROR_MIN_LENGTH);
      expect(error.data).toBe('password');
    }
  });

  it('should throw if password is weak and strong check is enabled', () => {
    const weakPassword = PasswordConstants.WEAK_EXEMPLE;

    try {
      PasswordValidator.validate(weakPassword);
      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error).toBeInstanceOf(FieldInvalid);
      expect(error.message).toBe(PasswordConstants.ERROR_WEAK_PASSWORD);
      expect(error.data).toBe('password');
    }
  });
});
