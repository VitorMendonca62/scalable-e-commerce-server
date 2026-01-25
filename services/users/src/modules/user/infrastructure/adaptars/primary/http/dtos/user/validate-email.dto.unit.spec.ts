import { EmailConstants } from '@modules/user/domain/values-objects/user/constants';
import { ValidationObjectFactory } from '@modules/user/infrastructure/helpers/dto-helper';
import { UserDTOFactory } from '@modules/user/infrastructure/helpers/users/factory';
import { ValidateEmailDTO } from './validate-email.dto';

describe('ValidateCodeForForgotPasswordDTO', () => {
  it('should sucess validation when all fields are valid', async () => {
    const dto = new ValidateEmailDTO();
    dto.email = EmailConstants.EXEMPLE;

    const errors = await ValidationObjectFactory.validateObject(dto);
    expect(errors).toHaveLength(0);
  });

  it('should return error when any field is undefined', async () => {
    const requiredFields = {
      email: EmailConstants.ERROR_REQUIRED,
    };

    Object.entries(requiredFields).forEach(async (field) => {
      const [key, message] = field;
      const dto = UserDTOFactory.createValidateEmailDTOLikeInstance({
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
      email: EmailConstants.ERROR_STRING,
    };

    Object.entries(requiredFields).forEach(async (field) => {
      const [key, message] = field;
      const dto = UserDTOFactory.createValidateEmailDTOLikeInstance({
        [key]: 1 as any,
      });

      const errors = await ValidationObjectFactory.validateObject(dto);
      const fieldError = errors[0];

      expect(errors).toHaveLength(1);
      expect(fieldError.constraints.isString).toBe(message);
    });
  });

  it('should return error when email is invalid', async () => {
    const dto = UserDTOFactory.createValidateEmailDTOLikeInstance({
      email: EmailConstants.WRONG_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors[0];

    expect(errors).toHaveLength(1);
    expect(fieldError.constraints.isEmail).toBe(EmailConstants.ERROR_INVALID);
  });
});
