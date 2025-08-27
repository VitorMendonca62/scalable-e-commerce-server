import { FieldInvalid } from '@modules/user2/domain/ports/primary/http/error.port';
import { EmailConstants } from './email-constants';
import { EmailValidator } from './email-validator';

describe('EmailValidator', () => {
  it('should not throw if email is valid', () => {
    const validEmail = EmailConstants.EXEMPLE;

    expect(() => EmailValidator.validate(validEmail)).not.toThrow();
  });

  it('should throw if email is empty', () => {
    expect(() => EmailValidator.validate('')).toThrow(
      new FieldInvalid(EmailConstants.ERROR_REQUIRED, 'email'),
    );
  });

  it('should throw if email is invalid', () => {
    const invalidEmail = EmailConstants.WRONG_EXEMPLE;

    expect(() => EmailValidator.validate(invalidEmail)).toThrow(
      new FieldInvalid(EmailConstants.ERROR_INVALID, 'email'),
    );
  });
});
