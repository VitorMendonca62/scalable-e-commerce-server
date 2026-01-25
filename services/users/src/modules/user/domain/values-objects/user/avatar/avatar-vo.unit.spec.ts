import AvatarConstants from './avatar-constants';
import AvatarVO from './avatar-vo';

describe('AvatarVO', () => {
  const constants = AvatarConstants;
  const valueObject = AvatarVO;

  it('should store a value', () => {
    const valueObjectResult = new valueObject(constants.EXEMPLE);
    expect(valueObjectResult.getValue()).toBe(constants.EXEMPLE);
    expect(typeof valueObjectResult.getValue()).toBe('string');
  });
});
