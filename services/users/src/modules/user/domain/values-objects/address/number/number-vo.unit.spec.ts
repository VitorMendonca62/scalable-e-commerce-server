import NumberConstants from './number-constants';

import NumberVO from './number-vo';

describe('NumberVO', () => {
  const constants = NumberConstants;
  const valueObject = NumberVO;

  it('should store a value', () => {
    const valueObjectResult = new valueObject(constants.EXEMPLE);
    expect(valueObjectResult.getValue()).toBe(constants.EXEMPLE);
    expect(typeof valueObjectResult.getValue()).toBe('string');
  });
});
