import { FieldInvalid } from '../../../ports/primary/http/error.port';
import { AvatarConstants } from './avatar-constants';
import { AvatarValidator } from './avatar-validator';

describe('AvatarValidator', () => {
  it('should not throw if avatar is valid', () => {
    const validAvatar = AvatarConstants.EXEMPLE;

    expect(() => AvatarValidator.validate(validAvatar, true)).not.toThrow();
  });

  it('should dont throw if value is empty and field is optional', () => {
    expect(() =>
      AvatarValidator.validate(
        AvatarConstants.ERROR_REQUIRED_EXEMPLE,
        false,
      ),
    ).not.toThrow();
  });

  it('should throw if avatar is empty', () => {
    expect(() =>
      AvatarValidator.validate(AvatarConstants.ERROR_REQUIRED_EXEMPLE, true),
    ).toThrow(new FieldInvalid(AvatarConstants.ERROR_REQUIRED, 'avatar'));
  });

  
  it('should throw if values is not a string', () => {
    expect(() =>
      AvatarValidator.validate(
        AvatarConstants.ERROR_STRING_EXEMPLE as any,
        true,
      ),
    ).toThrow(
      new FieldInvalid(AvatarConstants.ERROR_STRING, 'avatar'),
    );
  });

  it('should throw if valueis not a string and field is optional', () => {
    expect(() =>
      AvatarValidator.validate(
        AvatarConstants.ERROR_STRING_EXEMPLE as any,
        false,
      ),
    ).toThrow(new FieldInvalid(AvatarConstants.ERROR_STRING, 'avatar'));
  });


  it('should throw if avatar is invalid URL', () => {
    expect(() =>
      AvatarValidator.validate(AvatarConstants.ERROR_INVALID_EXEMPLE, true),
    ).toThrow(new FieldInvalid(AvatarConstants.ERROR_INVALID, 'avatar'));
  });

  it('should throw if avatar is too long', () => {
    expect(() =>
      AvatarValidator.validate(AvatarConstants.ERROR_TOO_LONG_EXEMPLE, true),
    ).toThrow(new FieldInvalid(AvatarConstants.ERROR_TOO_LONG, 'avatar'));
  });
});
