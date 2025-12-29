import { EmailConstants } from '@auth/domain/values-objects/email/email-constants';
import { ValidateCodeForForgotPasswordDTO } from './validate-code-for-forgot-pass.dto';
import {
  mockValidateCodeForForgotPasswordDTOLikeInstance,
  validateObject,
} from '@auth/infrastructure/helpers/tests/dtos-helper';

describe('ValidateCodeForForgotPasswordDTO', () => {
  it('should sucess validation when all fields are valid', async () => {
    const dto = new ValidateCodeForForgotPasswordDTO();
    dto.email = EmailConstants.EXEMPLE;
    dto.code = 'AAAAAA';

    const errors = await validateObject(dto);
    expect(errors).toHaveLength(0);
  });

  it('should return error when any field is undefined', async () => {
    const requiredFields = {
      email: EmailConstants.ERROR_REQUIRED,
      code: 'O código de recuperação é obrigatório.',
    };

    Object.entries(requiredFields).forEach(async (field) => {
      const [key, message] = field;
      const dto = mockValidateCodeForForgotPasswordDTOLikeInstance({
        [key]: undefined,
      });

      const errors = await validateObject(dto);
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
      code: 'O código deve ser uma string válida.',
    };

    Object.entries(requiredFields).forEach(async (field) => {
      const [key, message] = field;
      const dto = mockValidateCodeForForgotPasswordDTOLikeInstance({
        [key]: 1 as any,
      });

      const errors = await validateObject(dto);
      const fieldError = errors[0];

      expect(errors).toHaveLength(1);
      expect(fieldError.constraints.isString).toBe(message);
    });
  });

  it('should return error when email is invalid', async () => {
    const dto = mockValidateCodeForForgotPasswordDTOLikeInstance({
      email: EmailConstants.WRONG_EXEMPLE,
    });

    const errors = await validateObject(dto);
    const fieldError = errors[0];

    expect(errors).toHaveLength(1);
    expect(fieldError.constraints.isEmail).toBe(EmailConstants.ERROR_INVALID);
  });

  it('should return error when code no have 6 chars', async () => {
    const dto = mockValidateCodeForForgotPasswordDTOLikeInstance({
      code: 'sss',
    });

    const errors = await validateObject(dto);
    const fieldError = errors[0];

    expect(errors).toHaveLength(1);
    expect(fieldError.constraints.isLength).toBe(
      'O código de recuperação deve ter exatamente 6 caracteres.',
    );
  });
});
