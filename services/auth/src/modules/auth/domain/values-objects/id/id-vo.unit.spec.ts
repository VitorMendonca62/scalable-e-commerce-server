vi.unmock('@auth/domain/values-objects/id/id-vo');
import IDConstants from './id-constants';
import IDVO from './id-vo';

describe('IDVO', () => {
  it('should store a value', () => {
    const valueObject = new IDVO(IDConstants.EXEMPLE);
    expect(valueObject.getValue()).toBe(IDConstants.EXEMPLE);
    expect(typeof valueObject.getValue()).toBe('string');
  });
});
