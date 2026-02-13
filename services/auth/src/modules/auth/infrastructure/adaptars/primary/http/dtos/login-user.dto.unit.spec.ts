import {
  EmailConstants,
  PasswordConstants,
} from '@auth/domain/values-objects/constants';
import { ValidationObjectFactory } from '@auth/infrastructure/helpers/tests/dtos-factory';
import { LoginUserFactory } from '@auth/infrastructure/helpers/tests/user-factory';

describe('LoginUserDTO', () => {
  let validationObjectFactory: ValidationObjectFactory;

  beforeEach(() => {
    validationObjectFactory = new ValidationObjectFactory();
  });

  it('should sucess validation when all fields are valid', async () => {
    const errors = await validationObjectFactory.validateObject(
      LoginUserFactory.createDTOLikeInstance(),
    );
    expect(errors).toHaveLength(0);
  });

  it('should return error when any field is undefined', async () => {
    const requiredFields = {
      email: EmailConstants.ERROR_REQUIRED,
      password: PasswordConstants.ERROR_REQUIRED,
    };

    Object.entries(requiredFields).forEach(async (field) => {
      const [key, message] = field;
      const dto = LoginUserFactory.createDTOLikeInstance({
        [key]: undefined,
      });

      const errors = await validationObjectFactory.validateObject(dto);
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
      const dto = LoginUserFactory.createDTOLikeInstance({ [key]: 12345 });

      const errors = await validationObjectFactory.validateObject(dto);
      const fieldError = errors[0];

      expect(errors).toHaveLength(1);
      expect(fieldError.constraints.isString).toBe(message);
    });
  });

  it('should return error when any field is shorter than the allowed length', async () => {
    const dto = LoginUserFactory.createDTOLikeInstance({ password: 'a' });

    const errors = await validationObjectFactory.validateObject(dto);
    const fieldError = errors[0];

    expect(errors).toHaveLength(1);
    expect(fieldError.constraints.minLength).toBe(
      PasswordConstants.ERROR_MIN_LENGTH,
    );
  });

  it('should return error when email is invalid', async () => {
    const dto = LoginUserFactory.createDTOLikeInstance({
      email: EmailConstants.WRONG_EXEMPLE,
    });

    const errors = await validationObjectFactory.validateObject(dto);
    const fieldError = errors[0];

    expect(errors).toHaveLength(1);
    expect(fieldError.constraints.isEmail).toBe(EmailConstants.ERROR_INVALID);
  });
});
