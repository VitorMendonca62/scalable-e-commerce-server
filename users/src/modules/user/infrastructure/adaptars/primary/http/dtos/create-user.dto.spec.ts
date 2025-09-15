import { PasswordConstants } from '@modules/user/domain/constants/password-constants';
import { EmailConstants } from '@modules/user/domain/values-objects/user/email/email-constants';
import { NameConstants } from '@modules/user/domain/values-objects/user/name/name-constants';
import { PhoneNumberConstants } from '@modules/user/domain/values-objects/user/phone-number/phone-number-constants';
import { UsernameConstants } from '@modules/user/domain/values-objects/user/username/username-constants';
import { mockCreateUserDTOLikeInstance } from '@modules/user/infrastructure/helpers/tests.helper';
import { validate } from 'class-validator';

describe('CreateUserDTO', () => {
  it('should sucess validation when all fields are valid', async () => {
    const errors = await validate(mockCreateUserDTOLikeInstance());
    expect(errors).toHaveLength(0);
  });

  it('should return error when any field is undefined', async () => {
    const requiredFields = {
      username: UsernameConstants.ERROR_REQUIRED,
      name: NameConstants.ERROR_REQUIRED,
      email: EmailConstants.ERROR_REQUIRED,
      password: PasswordConstants.ERROR_REQUIRED,
      phonenumber: PhoneNumberConstants.ERROR_REQUIRED,
    };

    Object.entries(requiredFields).forEach(async (field) => {
      const [key, message] = field;
      const dto = mockCreateUserDTOLikeInstance({ [key]: undefined });

      const errors = await validate(dto);
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
      email: EmailConstants.ERROR_STRING,
      password: PasswordConstants.ERROR_STRING,
      phonenumber: PhoneNumberConstants.ERROR_STRING,
    };

    Object.entries(requiredFields).forEach(async (field) => {
      const [key, message] = field;
      const dto = mockCreateUserDTOLikeInstance({ [key]: 12345 });

      const errors = await validate(dto);
      const fieldError = errors[0];

      expect(fieldError.constraints.isString).toBe(message);
    });
  });

  it('should return error when any field is shorter than the allowed length', async () => {
    const requiredFields = {
      username: UsernameConstants.ERROR_MIN_LENGTH,
      name: NameConstants.ERROR_MIN_LENGTH,
      password: PasswordConstants.ERROR_MIN_LENGTH,
      phonenumber: PhoneNumberConstants.ERROR_LENGTH,
    };

    Object.entries(requiredFields).forEach(async (field) => {
      const [key, message] = field;
      const dto = mockCreateUserDTOLikeInstance({ [key]: 'a' });

      const errors = await validate(dto);
      const fieldError = errors[0];

      if (['phonenumber'].includes(key)) {
        expect(fieldError.constraints.isLength).toBe(message);
        return;
      }

      expect(fieldError.constraints.minLength).toBe(message);
    });
  });

  it('should return error when email is invalid', async () => {
    const dto = mockCreateUserDTOLikeInstance({
      email: EmailConstants.WRONG_EXEMPLE,
    });

    const errors = await validate(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.isEmail).toBe(EmailConstants.ERROR_INVALID);
  });

  it('should return error when password is not strong', async () => {
    const dto = mockCreateUserDTOLikeInstance({
      password: PasswordConstants.WEAK_EXEMPLE,
    });

    const errors = await validate(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.isStrongPassword).toBe(
      PasswordConstants.ERROR_WEAK_PASSWORD,
    );
  });

  it('should return error when password is not brazilian phonenumber', async () => {
    const dto = mockCreateUserDTOLikeInstance({
      phonenumber: PhoneNumberConstants.WRONG_EXEMPLE,
    });

    const errors = await validate(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.isPhoneNumber).toBe(
      PhoneNumberConstants.ERROR_INVALID,
    );
  });

  it('should return error when username have empyt spaces', async () => {
    const dto = mockCreateUserDTOLikeInstance({
      username: UsernameConstants.WRONG_EXEMPLE,
    });

    const errors = await validate(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.matches).toBe(
      UsernameConstants.ERROR_NO_SPACES,
    );
  });
});
