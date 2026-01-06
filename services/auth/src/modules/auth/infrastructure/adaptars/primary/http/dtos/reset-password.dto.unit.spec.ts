import { PasswordConstants } from '@auth/domain/values-objects/password/password-constants';
import { validateObject } from '@auth/infrastructure/helpers/tests/dtos-mocks';
import { ResetPasswordDTO } from './reset-password.dto';
import { addPrefix } from '@auth/infrastructure/helpers/string-helper';

describe('ResetPasswordDTO', () => {
  it('should sucess validation when all fields are valid', async () => {
    const dto = new ResetPasswordDTO();
    dto.newPassword = PasswordConstants.EXEMPLE;
    const errors = await validateObject(dto);
    expect(errors).toHaveLength(0);
  });

  it('should return error when any field is undefined', async () => {
    const dto = new ResetPasswordDTO();
    dto.newPassword = undefined;

    const errors = await validateObject(dto);
    const fieldError = errors[0];

    expect(errors).toHaveLength(1);
    expect(fieldError.value).toBeUndefined();
    expect(fieldError.property).toBe('newPassword');
    expect(fieldError.constraints.isNotEmpty).toBe(
      addPrefix(PasswordConstants.ERROR_REQUIRED, 'new'),
    );
  });

  it('should return error when any field is not string', async () => {
    const dto = new ResetPasswordDTO();
    dto.newPassword = 0 as any;

    const errors = await validateObject(dto);
    const fieldError = errors[0];

    expect(errors).toHaveLength(1);
    expect(fieldError.constraints.isString).toBe(
      addPrefix(PasswordConstants.ERROR_STRING, 'new'),
    );
  });

  it('should return error when any field is shorter than the allowed length', async () => {
    const dto = new ResetPasswordDTO();
    dto.newPassword = PasswordConstants.MIN_LENGTH_EXEMPLE;

    const errors = await validateObject(dto);
    const fieldError = errors[0];

    expect(errors).toHaveLength(1);
    expect(fieldError.constraints.minLength).toBe(
      addPrefix(PasswordConstants.ERROR_MIN_LENGTH, 'new'),
    );
  });

  it('should return error when password is weak', async () => {
    const dto = new ResetPasswordDTO();
    dto.newPassword = PasswordConstants.WEAK_EXEMPLE;

    const errors = await validateObject(dto);
    const fieldError = errors[0];

    expect(errors).toHaveLength(1);
    expect(fieldError.constraints.isStrongPassword).toBe(
      addPrefix(PasswordConstants.ERROR_WEAK_PASSWORD, 'new'),
    );
  });
});
