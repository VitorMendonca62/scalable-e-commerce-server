vi.unmock('@user/domain/values-objects/id/id-vo');

import IDConstants from './id-constants';

import IDVO from './id-vo';

describe('IDVO', () => {
  const constants = IDConstants;
  const valueObject = IDVO;

  it('should store a value', () => {
    const valueObjectResult = new valueObject(constants.EXEMPLE);
    expect(valueObjectResult.getValue()).toBe(constants.EXEMPLE);
    expect(typeof valueObjectResult.getValue()).toBe('string');
  });
});
