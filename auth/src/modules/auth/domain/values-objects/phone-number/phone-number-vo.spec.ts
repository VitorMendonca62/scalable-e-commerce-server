import { PhoneNumberConstants } from './phone-number-constants';
import PhoneNumberValidator from './phone-number-validator';
import PhoneNumberVO from './phone-number-vo';

describe('PhoneNumberVO', () => {
  beforeEach(() => {
    jest.spyOn(PhoneNumberValidator, 'validate').mockReturnValue();
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
    jest.spyOn(PhoneNumberValidator, 'validate').mockImplementation(() => {
      throw new Error('Error');
    });

    expect(() => {
      new PhoneNumberVO(PhoneNumberConstants.EXEMPLE);
    }).toThrow('Error');
  });
});
