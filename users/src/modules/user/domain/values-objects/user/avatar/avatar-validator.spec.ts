import { FieldInvalid } from '../../../ports/primary/http/error.port';
import { AvatarConstants } from './avatar-constants';
import { AvatarValidator } from './avatar-validator';

describe('AvatarValidator', () => {
  it('should not throw if avatar is valid', () => {
    const validAvatar = AvatarConstants.EXEMPLE;

    expect(() => AvatarValidator.validate(validAvatar)).not.toThrow();
  });

  it('should throw if avatar is empty', () => {
    expect(() =>
      AvatarValidator.validate(AvatarConstants.ERROR_REQUIRED_EXEMPLE),
    ).toThrow(new FieldInvalid(AvatarConstants.ERROR_REQUIRED, 'avatar'));
  });

  it('should throw if avatar is invalid URL', () => {
    expect(() =>
      AvatarValidator.validate(AvatarConstants.ERROR_INVALID_EXEMPLE),
    ).toThrow(new FieldInvalid(AvatarConstants.ERROR_INVALID, 'avatar'));
  });

  it('should throw if avatar is too long', () => {
    expect(() =>
      AvatarValidator.validate(AvatarConstants.ERROR_TOO_LONG_EXEMPLE),
    ).toThrow(new FieldInvalid(AvatarConstants.ERROR_TOO_LONG, 'avatar'));
  });
});
