import PostalCodeConstants from './postal-code-constants';

import PostalCodeVO from './postal-code-vo';

describe('PostalCodeVO', () => {
  const constants = PostalCodeConstants;
  const valueObject = PostalCodeVO;

  it('should store a value', () => {
    const valueObjectResult = new valueObject(constants.EXEMPLE);
    expect(valueObjectResult.getValue()).toBe(constants.EXEMPLE);
    expect(typeof valueObjectResult.getValue()).toBe('string');
  });
});
