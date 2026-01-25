import ComplementConstants from './complement-constants';

import ComplementVO from './complement-vo';

describe('ComplementVO', () => {
  const constants = ComplementConstants;
  const valueObject = ComplementVO;

  it('should store a value', () => {
    const valueObjectResult = new valueObject(constants.EXEMPLE);
    expect(valueObjectResult.getValue()).toBe(constants.EXEMPLE);
    expect(typeof valueObjectResult.getValue()).toBe('string');
  });
});
