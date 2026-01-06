import { FieldInvalid } from '@user/domain/ports/primary/http/error.port';
import { EmailConstants } from './email-constants';
import { EmailValidator } from './email-validator';

describe('EmailValidator', () => {
  it('should not throw if email is valid', () => {
    expect(() =>
      EmailValidator.validate(EmailConstants.EXEMPLE, true),
    ).not.toThrow();
  });

  it('should dont throw if value is empty and field is optional', () => {
    expect(() =>
      EmailValidator.validate(EmailConstants.ERROR_REQUIRED_EXEMPLE, false),
    ).not.toThrow();
  });

  it('should throw if email is empty', () => {
    expect(() =>
      EmailValidator.validate(
        EmailConstants.ERROR_REQUIRED_EXEMPLE as any,
        true,
      ),
    ).toThrow(new FieldInvalid(EmailConstants.ERROR_REQUIRED, 'email'));
  });

  it('should throw if email is not a string', () => {
    expect(() =>
      EmailValidator.validate(EmailConstants.ERROR_STRING_EXEMPLE as any, true),
    ).toThrow(new FieldInvalid(EmailConstants.ERROR_STRING, 'email'));
  });

  it('should throw if value is not a string and field is optional', () => {
    expect(() =>
      EmailValidator.validate(
        EmailConstants.ERROR_STRING_EXEMPLE as any,
        false,
      ),
    ).toThrow(new FieldInvalid(EmailConstants.ERROR_STRING, 'email'));
  });


  it('should throw if email is invalid', () => {
    expect(() =>
      EmailValidator.validate(EmailConstants.ERROR_INVALID_EXEMPLE, true),
    ).toThrow(new FieldInvalid(EmailConstants.ERROR_INVALID, 'email'));
  });
});
