import EmailValidator from './email-validator';
import EmailVO from './email-vo';
import { EmailConstants } from './email-constants';

describe('EmailVO', () => {
  beforeEach(() => {
    jest.spyOn(EmailValidator, 'validate').mockReturnValue();
  });

  it('should store a value', () => {
    const valueObject = new EmailVO(EmailConstants.EXEMPLE);
    expect(valueObject.getValue()).toBe(EmailConstants.EXEMPLE);
    expect(typeof valueObject.getValue()).toBe('string');
  });

  it('should call EmailValidator.validate with value', () => {
    new EmailVO(EmailConstants.EXEMPLE);

    expect(EmailValidator.validate).toHaveBeenCalledWith(
      EmailConstants.EXEMPLE,
    );
  });

  it('should rethrow error if validator throw error', () => {
    jest.spyOn(EmailValidator, 'validate').mockImplementation(() => {
      throw new Error('Error');
    });

    try {
      new EmailVO(EmailConstants.EXEMPLE);
      fail('Should have thrown an error');
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Error');
      expect(error.data).toBeUndefined();
    }
  });
});
