import PhoneNumberConstants from './phone-number-constants';

import PhoneNumberVO from './phone-number-vo';

describe('PhoneNumberVO', () => {
  const constants = PhoneNumberConstants;
  const valueObject = PhoneNumberVO;

  it('should store a value', () => {
    const valueObjectResult = new valueObject(constants.EXEMPLE);
    expect(valueObjectResult.getValue()).toBe(constants.EXEMPLE);
    expect(typeof valueObjectResult.getValue()).toBe('string');
  });
});
