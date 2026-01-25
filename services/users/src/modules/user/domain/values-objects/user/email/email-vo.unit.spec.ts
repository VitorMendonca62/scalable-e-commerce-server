import EmailConstants from './email-constants';
import EmailVO from './email-vo';

vi.unmock('@auth/domain/values-objects/email/email-vo');

describe('EmailVO', () => {
  const constants = EmailConstants;
  const valueObject = EmailVO;

  it('should store a value', () => {
    const valueObjectResult = new valueObject(constants.EXEMPLE);
    expect(valueObjectResult.getValue()).toBe(constants.EXEMPLE);
    expect(typeof valueObjectResult.getValue()).toBe('string');
  });
});
