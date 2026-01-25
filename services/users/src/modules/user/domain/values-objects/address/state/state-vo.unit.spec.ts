import StateConstants from './state-constants';

import StateVO from './state-vo';

describe('StateVO', () => {
  const constants = StateConstants;
  const valueObject = StateVO;

  it('should store a value', () => {
    const valueObjectResult = new valueObject(constants.EXEMPLE);
    expect(valueObjectResult.getValue()).toBe(constants.EXEMPLE);
    expect(typeof valueObjectResult.getValue()).toBe('string');
  });
});
