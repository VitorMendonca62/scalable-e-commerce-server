import { AvatarConstants } from '@modules/user/domain/values-objects/user/avatar/avatar-constants';
import { EmailConstants } from '@modules/user/domain/values-objects/user/email/email-constants';
import { NameConstants } from '@modules/user/domain/values-objects/user/name/name-constants';
import { PhoneNumberConstants } from '@modules/user/domain/values-objects/user/phone-number/phone-number-constants';
import { UsernameConstants } from '@modules/user/domain/values-objects/user/username/username-constants';
import { mockUpdateUserDTOLikeInstance } from '@modules/user/infrastructure/helpers/tests.helper';
import { validate } from 'class-validator';

describe('UpdateUserDTO', () => {
  it('should sucess validation when all fields are valid', async () => {
    const errors = await validate(mockUpdateUserDTOLikeInstance());
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
      const dto = mockUpdateUserDTOLikeInstance({ [key]: undefined });

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
      const dto = mockUpdateUserDTOLikeInstance({ [key]: 12345 });

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
      const dto = mockUpdateUserDTOLikeInstance({ [key]: 'a' });

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
    const dto = mockUpdateUserDTOLikeInstance({
      avatar: AvatarConstants.ERROR_TOO_LONG_EXEMPLE,
    });

    const errors = await validate(dto);
    const fieldError = errors[0];
    expect(fieldError.constraints.maxLength).toBe(
      AvatarConstants.ERROR_TOO_LONG,
    );
  });

  it('should return error when email is invalid', async () => {
    const dto = mockUpdateUserDTOLikeInstance({
      email: EmailConstants.WRONG_EXEMPLE,
    });

    const errors = await validate(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.isEmail).toBe(EmailConstants.ERROR_INVALID);
  });

  it('should return error when phonenumber is not brazilian phonenumber', async () => {
    const dto = mockUpdateUserDTOLikeInstance({
      phonenumber: PhoneNumberConstants.WRONG_EXEMPLE,
    });

    const errors = await validate(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.isPhoneNumber).toBe(
      PhoneNumberConstants.ERROR_INVALID,
    );
  });

  it('should return error when username have empyt spaces', async () => {
    const dto = mockUpdateUserDTOLikeInstance({
      username: UsernameConstants.WRONG_EXEMPLE,
    });

    const errors = await validate(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.matches).toBe(
      UsernameConstants.ERROR_NO_SPACES,
    );
  });

  it('should return error when avatar is not url', async () => {
    const dto = mockUpdateUserDTOLikeInstance({
      avatar: AvatarConstants.WRONG_EXEMPLE,
    });

    const errors = await validate(dto);
    const fieldError = errors[0];
    console.error(fieldError)
    expect(fieldError.constraints.isUrl).toBe(
      AvatarConstants.ERROR_INVALID,
    );
  });
});
