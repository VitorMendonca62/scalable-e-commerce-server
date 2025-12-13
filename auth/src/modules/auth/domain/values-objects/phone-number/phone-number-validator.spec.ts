import PhoneNumberValidator from './phone-number-validator';
import { PhoneNumberConstants } from './phone-number-constants';
import { FieldInvalid } from '../../ports/primary/http/errors.port';

describe('PhoneNumberValidator', () => {
  it('should not throw if phone number is valid', () => {
    const validPhone = PhoneNumberConstants.EXEMPLE;

    expect(() => PhoneNumberValidator.validate(validPhone)).not.toThrow();
  });

  it('should throw if phone number is empty', () => {
    expect(() => PhoneNumberValidator.validate('')).toThrow(
      new FieldInvalid(PhoneNumberConstants.ERROR_REQUIRED, 'phonenumber'),
    );
  });

  it('should throw if phone number is not a string', () => {
    expect(() => PhoneNumberValidator.validate(12345678901 as any)).toThrow(
      new FieldInvalid(PhoneNumberConstants.ERROR_STRING, 'phonenumber'),
    );
  });

  it('should throw if phone number length is not equal to 11', () => {
    const wrongLengthPhone = '119999999';

    expect(() => PhoneNumberValidator.validate(wrongLengthPhone)).toThrow(
      new FieldInvalid(PhoneNumberConstants.ERROR_LENGTH, 'phonenumber'),
    );
  });

  it('should throw if phone number is not a valid BR phone', () => {
    const invalidBRPhone = '11111111111111';

    expect(() => PhoneNumberValidator.validate(invalidBRPhone)).toThrow(
      new FieldInvalid(PhoneNumberConstants.ERROR_INVALID, 'phonenumber'),
    );
  });
});
