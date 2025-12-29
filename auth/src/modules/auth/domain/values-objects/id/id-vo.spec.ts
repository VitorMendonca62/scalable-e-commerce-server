import IDValidator from './id-validator';
import IDVO from './id-vo';
import { IDConstants } from './id-constants';

describe('IDVO', () => {
  beforeEach(() => {
    jest.spyOn(IDValidator, 'validate').mockReturnValue();
  });

  it('should store a value', () => {
    const valueObject = new IDVO(IDConstants.EXEMPLE);
    expect(valueObject.getValue()).toBe(IDConstants.EXEMPLE);
    expect(typeof valueObject.getValue()).toBe('string');
  });

  it('should call IdValidator.validate with value', () => {
    new IDVO(IDConstants.EXEMPLE);

    expect(IDValidator.validate).toHaveBeenCalledWith(IDConstants.EXEMPLE);
  });

  it('should rethrow error if validator throw error', () => {
    jest.spyOn(IDValidator, 'validate').mockImplementation(() => {
      throw new Error('Error');
    });

    try {
      new IDVO(IDConstants.EXEMPLE);
      fail('Should have thrown an error');
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Error');
      expect(error.data).toBeUndefined();
    }
  });
});
