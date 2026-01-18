vi.unmock('@auth/domain/values-objects/email/email-vo');
import EmailValidator from './email-validator';
import EmailVO from './email-vo';
import { EmailConstants } from './email-constants';

describe('EmailVO', () => {
  beforeEach(() => {
    vi.spyOn(EmailValidator, 'validate').mockReturnValue();
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
    vi.spyOn(EmailValidator, 'validate').mockImplementation(() => {
      throw new Error('Error');
    });

    try {
      new EmailVO(EmailConstants.EXEMPLE);
      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Error');
      expect(error.data).toBeUndefined();
    }
  });
});
