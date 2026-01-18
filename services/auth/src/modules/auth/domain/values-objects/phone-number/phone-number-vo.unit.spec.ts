import { PhoneNumberConstants } from './phone-number-constants';
import PhoneNumberValidator from './phone-number-validator';
import PhoneNumberVO from './phone-number-vo';
vi.unmock('@auth/domain/values-objects/phone-number/phone-number-vo');

describe('PhoneNumberVO', () => {
  beforeEach(() => {
    vi.spyOn(PhoneNumberValidator, 'validate').mockReturnValue();
  });

  it('should store a value', () => {
    const valueObject = new PhoneNumberVO(PhoneNumberConstants.EXEMPLE);
    expect(valueObject.getValue()).toBe(PhoneNumberConstants.EXEMPLE);
    expect(typeof valueObject.getValue()).toBe('string');
  });

  it('should call PhoneNumberValidator.validate with value', () => {
    new PhoneNumberVO(PhoneNumberConstants.EXEMPLE);

    expect(PhoneNumberValidator.validate).toHaveBeenCalledWith(
      PhoneNumberConstants.EXEMPLE,
    );
  });

  it('should rethrow error if validator throw error', () => {
    vi.spyOn(PhoneNumberValidator, 'validate').mockImplementation(() => {
      throw new Error('Error');
    });

    try {
      new PhoneNumberVO(PhoneNumberConstants.EXEMPLE);
      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Error');
      expect(error.data).toBeUndefined();
    }
  });
});
