import {
  UsernameConstants,
  NameConstants,
  AvatarConstants,
  PhoneNumberConstants,
} from '@modules/user/domain/values-objects/user/constants';
import { ValidationObjectFactory } from '@modules/user/infrastructure/helpers/dto-helper';
import { UserDTOFactory } from '@modules/user/infrastructure/helpers/users/factory';

describe('UpdateUserDTO', () => {
  it('should sucess validation when all fields are valid', async () => {
    const errors = await ValidationObjectFactory.validateObject(
      UserDTOFactory.createUpdateUserDTOLikeInstance(),
    );
    expect(errors).toHaveLength(0);
  });

  it('should no have erros if field is undefined', async () => {
    const requiredFields = {
      username: UsernameConstants.ERROR_REQUIRED,
      name: NameConstants.ERROR_REQUIRED,
      avatar: AvatarConstants.ERROR_REQUIRED,
      phoneNumber: PhoneNumberConstants.ERROR_REQUIRED,
    };

    Object.entries(requiredFields).forEach(async (field) => {
      const [key] = field;
      const dto = UserDTOFactory.createUpdateUserDTOLikeInstance({
        [key]: undefined,
      });

      const errors = await ValidationObjectFactory.validateObject(dto);

      expect(errors).toHaveLength(0);
    });
  });

  it('should return error when any field is not string', async () => {
    const requiredFields = {
      username: UsernameConstants.ERROR_STRING,
      name: NameConstants.ERROR_STRING,
      avatar: AvatarConstants.ERROR_STRING,
      phoneNumber: PhoneNumberConstants.ERROR_STRING,
    };

    Object.entries(requiredFields).forEach(async (field) => {
      const [key, message] = field;
      const dto = UserDTOFactory.createUpdateUserDTOLikeInstance({
        [key]: 12345,
      });

      const errors = await ValidationObjectFactory.validateObject(dto);
      const fieldError = errors[0];

      expect(fieldError.constraints.isString).toBe(message);
    });
  });

  it('should return error when any field is shorter than the allowed length', async () => {
    const requiredFields = {
      username: UsernameConstants.ERROR_MIN_LENGTH,
      name: NameConstants.ERROR_MIN_LENGTH,
      phoneNumber: PhoneNumberConstants.ERROR_LENGTH,
    };

    Object.entries(requiredFields).forEach(async (field) => {
      const [key, message] = field;
      const dto = UserDTOFactory.createUpdateUserDTOLikeInstance({
        [key]: 'a',
      });

      const errors = await ValidationObjectFactory.validateObject(dto);
      const fieldError = errors[0];
      if (['phoneNumber'].includes(key)) {
        expect(fieldError.constraints.isLength).toBe(message);
        return;
      }

      expect(fieldError.constraints.minLength).toBe(message);
    });
  });

  it('should return error avatar value is bigger than the allowed length', async () => {
    const dto = UserDTOFactory.createUpdateUserDTOLikeInstance({
      avatar: AvatarConstants.ERROR_TOO_LONG_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors[0];
    expect(fieldError.constraints.maxLength).toBe(
      AvatarConstants.ERROR_TOO_LONG,
    );
  });

  it('should return error when phoneNumber is not brazilian phoneNumber', async () => {
    const dto = UserDTOFactory.createUpdateUserDTOLikeInstance({
      phoneNumber: PhoneNumberConstants.WRONG_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.isPhoneNumber).toBe(
      PhoneNumberConstants.ERROR_INVALID,
    );
  });

  it('should return error when username have empyt spaces', async () => {
    const dto = UserDTOFactory.createUpdateUserDTOLikeInstance({
      username: UsernameConstants.WRONG_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.matches).toBe(
      UsernameConstants.ERROR_NO_SPACES,
    );
  });

  it('should return error when avatar is not url', async () => {
    const dto = UserDTOFactory.createUpdateUserDTOLikeInstance({
      avatar: AvatarConstants.WRONG_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors[0];
    expect(fieldError.constraints.isUrl).toBe(AvatarConstants.ERROR_INVALID);
  });
});
