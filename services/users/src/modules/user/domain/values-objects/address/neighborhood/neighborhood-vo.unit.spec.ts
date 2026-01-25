import NeighborhoodConstants from './neighborhood-constants';

import NeighborhoodVO from './neighborhood-vo';

describe('NeighborhoodVO', () => {
  const constants = NeighborhoodConstants;
  const valueObject = NeighborhoodVO;

  it('should store a value', () => {
    const valueObjectResult = new valueObject(constants.EXEMPLE);
    expect(valueObjectResult.getValue()).toBe(constants.EXEMPLE);
    expect(typeof valueObjectResult.getValue()).toBe('string');
  });
});
