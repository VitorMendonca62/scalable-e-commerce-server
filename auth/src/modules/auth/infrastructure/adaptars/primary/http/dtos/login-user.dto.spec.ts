import { EmailConstants } from '@modules/auth/domain/values-objects/email/email-constants';
import { PasswordConstants } from '@modules/auth/domain/values-objects/password/password-constants';
import { mockLoginUserDTOLikeInstance } from '@modules/auth/infrastructure/helpers/tests/tests.helper';
import { validate } from 'class-validator';

describe('LoginUserDTO', () => {
  it('should sucess validation when all fields are valid', async () => {
    const errors = await validate(mockLoginUserDTOLikeInstance());
    expect(errors).toHaveLength(0);
  });

  it('should return error when any field is undefined', async () => {
    const requiredFields = {
      email: EmailConstants.ERROR_REQUIRED,
      password: PasswordConstants.ERROR_REQUIRED,
    };

    Object.entries(requiredFields).forEach(async (field) => {
      const [key, message] = field;
      const dto = mockLoginUserDTOLikeInstance({ [key]: undefined });

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
      email: EmailConstants.ERROR_STRING,
      password: PasswordConstants.ERROR_STRING,
    };

    Object.entries(requiredFields).forEach(async (field) => {
      const [key, message] = field;
      const dto = mockLoginUserDTOLikeInstance({ [key]: 12345 });

      const errors = await validate(dto);
      const fieldError = errors[0];

      expect(fieldError.constraints.isString).toBe(message);
    });
  });

  it('should return error when any field is shorter than the allowed length', async () => {
    const dto = mockLoginUserDTOLikeInstance({ password: 'a' });

    const errors = await validate(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.minLength).toBe(
      PasswordConstants.ERROR_MIN_LENGTH,
    );
  });

  it('should return error when email is invalid', async () => {
    const dto = mockLoginUserDTOLikeInstance({
      email: EmailConstants.WRONG_EXEMPLE,
    });

    const errors = await validate(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.isEmail).toBe(EmailConstants.ERROR_INVALID);
  });
});
