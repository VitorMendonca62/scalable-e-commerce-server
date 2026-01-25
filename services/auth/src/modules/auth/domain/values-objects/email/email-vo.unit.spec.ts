import { EmailConstants } from '../constants';
import EmailVO from './email-vo';

describe('EmailVO', () => {
  it('should store a value', () => {
    const valueObject = new EmailVO(EmailConstants.EXEMPLE);
    expect(valueObject.getValue()).toBe(EmailConstants.EXEMPLE);
    expect(typeof valueObject.getValue()).toBe('string');
  });
});
