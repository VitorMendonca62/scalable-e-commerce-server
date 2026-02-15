import {
  UpdatePasswordDTOFactory,
  ValidationObjectFactory,
} from '@auth/infrastructure/helpers/tests/dtos-factory';
import { addPrefix } from '@auth/infrastructure/helpers/string-helper';
import { PasswordConstants } from '@auth/domain/values-objects/constants';

describe('UpdatePasswordDTO', () => {
  let updatePasswordDTOFactory: UpdatePasswordDTOFactory;
  let validationObjectFactory: ValidationObjectFactory;

  beforeEach(() => {
    updatePasswordDTOFactory = new UpdatePasswordDTOFactory();
    validationObjectFactory = new ValidationObjectFactory();
  });

  it('should sucess validation when all fields are valid', async () => {
    const dto = updatePasswordDTOFactory.likeInstance();
    const errors = await validationObjectFactory.validateObject(dto);
    expect(errors).toHaveLength(0);
  });

  it('should return error when any field is undefined', async () => {
    const requiredFields = {
      newPassword: addPrefix(PasswordConstants.ERROR_REQUIRED, 'new'),
      oldPassword: addPrefix(PasswordConstants.ERROR_REQUIRED, 'old'),
    };

    Object.entries(requiredFields).forEach(async (field) => {
      const [key, message] = field;
      const dto = updatePasswordDTOFactory.likeInstance({
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
      newPassword: addPrefix(PasswordConstants.ERROR_STRING, 'new'),
      oldPassword: addPrefix(PasswordConstants.ERROR_STRING, 'old'),
    };

    Object.entries(requiredFields).forEach(async (field) => {
      const [key, message] = field;
      const dto = updatePasswordDTOFactory.likeInstance({
        [key]: 1 as any,
      });

      const errors = await validationObjectFactory.validateObject(dto);
      const fieldError = errors[0];

      expect(errors).toHaveLength(1);
      expect(fieldError.constraints.isString).toBe(message);
    });
  });

  it('should return error when any field is shorter than the allowed length', async () => {
    const requiredFields = {
      newPassword: addPrefix(PasswordConstants.ERROR_MIN_LENGTH, 'new'),
      oldPassword: addPrefix(PasswordConstants.ERROR_MIN_LENGTH, 'old'),
    };

    Object.entries(requiredFields).forEach(async (field) => {
      const [key, message] = field;
      const dto = updatePasswordDTOFactory.likeInstance({
        [key]: PasswordConstants.MIN_LENGTH_EXEMPLE,
      });

      const errors = await validationObjectFactory.validateObject(dto);
      const fieldError = errors[0];

      expect(errors).toHaveLength(1);
      expect(fieldError.constraints.minLength).toBe(message);
    });
  });

  it('should return error when password is weak', async () => {
    const requiredFields = {
      newPassword: addPrefix(PasswordConstants.ERROR_WEAK_PASSWORD, 'new'),
    };

    Object.entries(requiredFields).forEach(async (field) => {
      const [key, message] = field;
      const dto = updatePasswordDTOFactory.likeInstance({
        [key]: PasswordConstants.WEAK_EXEMPLE,
      });

      const errors = await validationObjectFactory.validateObject(dto);
      const fieldError = errors[0];
      expect(errors).toHaveLength(1);
      expect(fieldError.constraints.isStrongPassword).toBe(message);
    });
  });
});
