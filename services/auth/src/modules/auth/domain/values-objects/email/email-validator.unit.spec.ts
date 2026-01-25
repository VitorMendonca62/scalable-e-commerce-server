import { FieldInvalid } from '../../ports/primary/http/errors.port';
import { EmailConstants } from './email-constants';
import EmailValidator from './email-validator';

describe('EmailValidator', () => {
  it('should not throw if email is valid', () => {
    const validEmail = EmailConstants.EXEMPLE;

    expect(() => EmailValidator.validate(validEmail)).not.toThrow();
  });

  it('should throw if email is empty', () => {
    try {
      EmailValidator.validate('');
      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error).toBeInstanceOf(FieldInvalid);
      expect(error.message).toBe(EmailConstants.ERROR_REQUIRED);
      expect(error.data).toBe('email');
    }
  });

  it('should throw if email is invalid', () => {
    const invalidEmail = EmailConstants.WRONG_EXEMPLE;

    try {
      EmailValidator.validate(invalidEmail);
      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error).toBeInstanceOf(FieldInvalid);
      expect(error.message).toBe(EmailConstants.ERROR_INVALID);
      expect(error.data).toBe('email');
    }
  });
});
