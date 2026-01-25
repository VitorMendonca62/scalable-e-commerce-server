import PhoneNumberValidator from './phone-number-validator';
import { PhoneNumberConstants } from './phone-number-constants';
import { FieldInvalid } from '../../ports/primary/http/errors.port';

describe('PhoneNumberValidator', () => {
  it('should not throw if phone number is valid', () => {
    const validPhone = PhoneNumberConstants.EXEMPLE;

    expect(() => PhoneNumberValidator.validate(validPhone)).not.toThrow();
  });

  it('should not throw if phone number is empyt', () => {
    const validPhone = '';

    expect(() => PhoneNumberValidator.validate(validPhone)).not.toThrow();
  });

  it('should throw if phone number is not a string', () => {
    try {
      PhoneNumberValidator.validate(12345678901 as any);
      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error).toBeInstanceOf(FieldInvalid);
      expect(error.message).toBe(PhoneNumberConstants.ERROR_STRING);
      expect(error.data).toBe('phoneNumber');
    }
  });

  it('should throw if phone number length is not equal to 11', () => {
    const wrongLengthPhone = '119999999';

    try {
      PhoneNumberValidator.validate(wrongLengthPhone);
      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error).toBeInstanceOf(FieldInvalid);
      expect(error.message).toBe(PhoneNumberConstants.ERROR_LENGTH);
      expect(error.data).toBe('phoneNumber');
    }
  });

  it('should throw if phone number is not a valid BR phone', () => {
    const invalidBRPhone = '11111111111111';

    try {
      PhoneNumberValidator.validate(invalidBRPhone);
      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error).toBeInstanceOf(FieldInvalid);
      expect(error.message).toBe(PhoneNumberConstants.ERROR_INVALID);
      expect(error.data).toBe('phoneNumber');
    }
  });
});
