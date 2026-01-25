import { PasswordConstants } from '@modules/user/domain/constants/password-constants';
import {
  UsernameConstants,
  NameConstants,
  PhoneNumberConstants,
} from '@modules/user/domain/values-objects/user/constants';
import { ValidationObjectFactory } from '@modules/user/infrastructure/helpers/dto-helper';
import { UserDTOFactory } from '@modules/user/infrastructure/helpers/users/factory';

describe('CreateUserDTO', () => {
  it('should sucess validation when all fields are valid', async () => {
    const errors = await ValidationObjectFactory.validateObject(
      UserDTOFactory.createCreateUserDTOLikeInstance(),
    );
    expect(errors).toHaveLength(0);
  });

  it('should return error when any field is undefined', async () => {
    const requiredFields = {
      username: UsernameConstants.ERROR_REQUIRED,
      name: NameConstants.ERROR_REQUIRED,
      password: PasswordConstants.ERROR_REQUIRED,
      phoneNumber: PhoneNumberConstants.ERROR_REQUIRED,
    };

    Object.entries(requiredFields).forEach(async (field) => {
      const [key, message] = field;
      const dto = UserDTOFactory.createCreateUserDTOLikeInstance({
        [key]: undefined,
      });

      const errors = await ValidationObjectFactory.validateObject(dto);
      const fieldError = errors[0];

      expect(errors).toHaveLength(1);
      expect(fieldError.value).toBeUndefined();
      expect(fieldError.property).toBe(key);
      expect(fieldError.constraints.isNotEmpty).toBe(message);
    });
  });

  it('should return error when any field is not string', async () => {
    const requiredFields = {
      username: UsernameConstants.ERROR_STRING,
      name: NameConstants.ERROR_STRING,
      password: PasswordConstants.ERROR_STRING,
      phoneNumber: PhoneNumberConstants.ERROR_STRING,
    };

    Object.entries(requiredFields).forEach(async (field) => {
      const [key, message] = field;
      const dto = UserDTOFactory.createCreateUserDTOLikeInstance({
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
      password: PasswordConstants.ERROR_MIN_LENGTH,
      phoneNumber: PhoneNumberConstants.ERROR_LENGTH,
    };

    Object.entries(requiredFields).forEach(async (field) => {
      const [key, message] = field;
      const dto = UserDTOFactory.createCreateUserDTOLikeInstance({
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

  it('should return error when password is not strong', async () => {
    const dto = UserDTOFactory.createCreateUserDTOLikeInstance({
      password: PasswordConstants.WEAK_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.isStrongPassword).toBe(
      PasswordConstants.ERROR_WEAK_PASSWORD,
    );
  });

  it('should return error when phoneNumber is not brazilian phoneNumber', async () => {
    const dto = UserDTOFactory.createCreateUserDTOLikeInstance({
      phoneNumber: PhoneNumberConstants.WRONG_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);

    const fieldError = errors[0];

    expect(fieldError.constraints.isPhoneNumber).toBe(
      PhoneNumberConstants.ERROR_INVALID,
    );
  });

  it('should return error when username have empyt spaces', async () => {
    const dto = UserDTOFactory.createCreateUserDTOLikeInstance({
      username: UsernameConstants.WRONG_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.matches).toBe(
      UsernameConstants.ERROR_NO_SPACES,
    );
  });
});
