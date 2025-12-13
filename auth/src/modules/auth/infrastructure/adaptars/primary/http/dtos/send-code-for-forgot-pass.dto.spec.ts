import { EmailConstants } from '@auth/domain/values-objects/email/email-constants';
import { SendCodeForForgotPassword } from './send-code-for-forgot-pass.dto';
import { validate } from 'class-validator';

describe('SendCodeForForgotPassword', () => {
  it('should sucess validation when all fields are valid', async () => {
    const dto = new SendCodeForForgotPassword();
    dto.email = EmailConstants.EXEMPLE;
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should return error when any field is undefined', async () => {
    const dto = new SendCodeForForgotPassword();
    dto.email = undefined;

    const errors = await validate(dto);
    const fieldError = errors[0];

    expect(errors).toHaveLength(1);
    expect(fieldError.value).toBeUndefined();
    expect(fieldError.property).toBe('email');
    expect(fieldError.constraints.isNotEmpty).toBe(
      EmailConstants.ERROR_REQUIRED,
    );
  });

  it('should return error when any field is not string', async () => {
    const dto = new SendCodeForForgotPassword();
    dto.email = 0 as any;

    const errors = await validate(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.isString).toBe(EmailConstants.ERROR_STRING);
  });

  it('should return error when email is invalid', async () => {
    const dto = new SendCodeForForgotPassword();
    dto.email = EmailConstants.WRONG_EXEMPLE;

    const errors = await validate(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.isEmail).toBe(EmailConstants.ERROR_INVALID);
  });
});
