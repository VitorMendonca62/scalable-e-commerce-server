import UsernameConstants from './username-constants';

import UsernameVO from './username-vo';

vi.unmock('@auth/domain/values-objects/username/username-vo');

describe('UsernameVO', () => {
  const constants = UsernameConstants;
  const valueObject = UsernameVO;

  it('should store a value', () => {
    const valueObjectResult = new valueObject(constants.EXEMPLE);
    expect(valueObjectResult.getValue()).toBe(constants.EXEMPLE);
    expect(typeof valueObjectResult.getValue()).toBe('string');
  });
});
