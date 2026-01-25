import CountryConstants from './country-constants';

import CountryVO from './country-vo';

describe('CountryVO', () => {
  const constants = CountryConstants;
  const valueObject = CountryVO;

  it('should store a value', () => {
    const valueObjectResult = new valueObject(constants.EXEMPLE);
    expect(valueObjectResult.getValue()).toBe(constants.EXEMPLE);
    expect(typeof valueObjectResult.getValue()).toBe('string');
  });
});
