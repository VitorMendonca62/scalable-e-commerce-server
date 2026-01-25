import NameConstants from './name-constants';
import NameVO from './name-vo';

vi.unmock('@auth/domain/values-objects/name/name-vo');

describe('NameVO', () => {
  const constants = NameConstants;
  const valueObject = NameVO;

  it('should store a value', () => {
    const valueObjectResult = new valueObject(constants.EXEMPLE);
    expect(valueObjectResult.getValue()).toBe(constants.EXEMPLE);
    expect(typeof valueObjectResult.getValue()).toBe('string');
  });
});
