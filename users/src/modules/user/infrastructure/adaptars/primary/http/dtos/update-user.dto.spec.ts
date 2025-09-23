import {
  UsernameConstants,
  NameConstants,
  EmailConstants,
  AvatarConstants,
  PhoneNumberConstants,
} from '@modules/user/domain/values-objects/user/constants';
import { UserDTO } from '@modules/user/infrastructure/helpers/users/user-factory';
import { validate } from 'class-validator';

describe('UpdateUserDTO', () => {
  it('should sucess validation when all fields are valid', async () => {
    const errors = await validate(UserDTO.createUpdateUserDTOLikeInstance());
    expect(errors).toHaveLength(0);
  });

  it('should no have erros if field is undefined', async () => {
    const requiredFields = {
      username: UsernameConstants.ERROR_REQUIRED,
      name: NameConstants.ERROR_REQUIRED,
      email: EmailConstants.ERROR_REQUIRED,
      avatar: AvatarConstants.ERROR_REQUIRED,
      phonenumber: PhoneNumberConstants.ERROR_REQUIRED,
    };

    Object.entries(requiredFields).forEach(async (field) => {
      const [key, _] = field;
      const dto = UserDTO.createUpdateUserDTOLikeInstance({ [key]: undefined });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });

  it('should return error when any field is not string', async () => {
    const requiredFields = {
      username: UsernameConstants.ERROR_STRING,
      name: NameConstants.ERROR_STRING,
      email: EmailConstants.ERROR_STRING,
      avatar: AvatarConstants.ERROR_STRING,
      phonenumber: PhoneNumberConstants.ERROR_STRING,
    };

    Object.entries(requiredFields).forEach(async (field) => {
      const [key, message] = field;
      const dto = UserDTO.createUpdateUserDTOLikeInstance({ [key]: 12345 });

      const errors = await validate(dto);
      const fieldError = errors[0];

      expect(fieldError.constraints.isString).toBe(message);
    });
  });

  it('should return error when any field is shorter than the allowed length', async () => {
    const requiredFields = {
      username: UsernameConstants.ERROR_MIN_LENGTH,
      name: NameConstants.ERROR_MIN_LENGTH,
      phonenumber: PhoneNumberConstants.ERROR_LENGTH,
    };

    Object.entries(requiredFields).forEach(async (field) => {
      const [key, message] = field;
      const dto = UserDTO.createUpdateUserDTOLikeInstance({ [key]: 'a' });

      const errors = await validate(dto);
      const fieldError = errors[0];
      if (['phonenumber'].includes(key)) {
        expect(fieldError.constraints.isLength).toBe(message);
        return;
      }

      expect(fieldError.constraints.minLength).toBe(message);
    });
  });

  it('should return error avatar value is bigger than the allowed length', async () => {
    const dto = UserDTO.createUpdateUserDTOLikeInstance({
      avatar: AvatarConstants.ERROR_TOO_LONG_EXEMPLE,
    });

    const errors = await validate(dto);
    const fieldError = errors[0];
    expect(fieldError.constraints.maxLength).toBe(
      AvatarConstants.ERROR_TOO_LONG,
    );
  });

  it('should return error when email is invalid', async () => {
    const dto = UserDTO.createUpdateUserDTOLikeInstance({
      email: EmailConstants.WRONG_EXEMPLE,
    });

    const errors = await validate(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.isEmail).toBe(EmailConstants.ERROR_INVALID);
  });

  it('should return error when phonenumber is not brazilian phonenumber', async () => {
    const dto = UserDTO.createUpdateUserDTOLikeInstance({
      phonenumber: PhoneNumberConstants.WRONG_EXEMPLE,
    });

    const errors = await validate(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.isPhoneNumber).toBe(
      PhoneNumberConstants.ERROR_INVALID,
    );
  });

  it('should return error when username have empyt spaces', async () => {
    const dto = UserDTO.createUpdateUserDTOLikeInstance({
      username: UsernameConstants.WRONG_EXEMPLE,
    });

    const errors = await validate(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.matches).toBe(
      UsernameConstants.ERROR_NO_SPACES,
    );
  });

  it('should return error when avatar is not url', async () => {
    const dto = UserDTO.createUpdateUserDTOLikeInstance({
      avatar: AvatarConstants.WRONG_EXEMPLE,
    });

    const errors = await validate(dto);
    const fieldError = errors[0];
    expect(fieldError.constraints.isUrl).toBe(AvatarConstants.ERROR_INVALID);
  });
});
