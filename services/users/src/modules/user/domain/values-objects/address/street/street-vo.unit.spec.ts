import StreetConstants from './street-constants';

import StreetVO from './street-vo';

describe('StreetVO', () => {
  const constants = StreetConstants;
  const valueObject = StreetVO;

  it('should store a value', () => {
    const valueObjectResult = new valueObject(constants.EXEMPLE);
    expect(valueObjectResult.getValue()).toBe(constants.EXEMPLE);
    expect(typeof valueObjectResult.getValue()).toBe('string');
  });
});
