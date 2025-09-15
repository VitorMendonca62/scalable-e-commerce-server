import { PhoneNumberValidator } from './phone-number-validator';
import { PhoneNumberConstants } from './phone-number-constants';
import { FieldInvalid } from '@user/domain/ports/primary/http/error.port';

describe('PhoneNumberValidator', () => {
  it('should not throw if phone number is valid', () => {
    const validPhone = PhoneNumberConstants.EXEMPLE;

    expect(() => PhoneNumberValidator.validate(validPhone, true)).not.toThrow();
  });

  it('should dont throw if value is empty and field is optional', () => {
    expect(() =>
      PhoneNumberValidator.validate(
        PhoneNumberConstants.ERROR_REQUIRED_EXEMPLE,
        false,
      ),
    ).not.toThrow();
  });

  it('should throw if phone number is empty', () => {
    expect(() =>
      PhoneNumberValidator.validate(
        PhoneNumberConstants.ERROR_REQUIRED_EXEMPLE,
        true,
      ),
    ).toThrow(
      new FieldInvalid(PhoneNumberConstants.ERROR_REQUIRED, 'phonenumber'),
    );
  });

  it('should throw if phone number is not a string', () => {
    expect(() =>
      PhoneNumberValidator.validate(
        PhoneNumberConstants.ERROR_STRING_EXEMPLE as any,
        true,
      ),
    ).toThrow(
      new FieldInvalid(PhoneNumberConstants.ERROR_STRING, 'phonenumber'),
    );
  });

  it('should throw if valueis not a string and field is optional', () => {
    expect(() =>
      PhoneNumberValidator.validate(
        PhoneNumberConstants.ERROR_STRING_EXEMPLE as any,
        false,
      ),
    ).toThrow(new FieldInvalid(PhoneNumberConstants.ERROR_STRING, 'phonenumber'));
  });

  it('should throw if phone number length is not equal to 11', () => {
    expect(() =>
      PhoneNumberValidator.validate(
        PhoneNumberConstants.ERROR_LENGTH_EXEMPLE,
        true,
      ),
    ).toThrow(
      new FieldInvalid(PhoneNumberConstants.ERROR_LENGTH, 'phonenumber'),
    );
  });

  it('should throw if phone number is not a valid BR phone', () => {
    expect(() =>
      PhoneNumberValidator.validate(
        PhoneNumberConstants.ERROR_INVALID_EXEMPLE,
        true,
      ),
    ).toThrow(
      new FieldInvalid(PhoneNumberConstants.ERROR_INVALID, 'phonenumber'),
    );
  });
});
