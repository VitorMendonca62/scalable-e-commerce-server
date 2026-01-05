import { EmailConstants } from '@auth/domain/values-objects/email/email-constants';
import { PasswordConstants } from '@auth/domain/values-objects/password/password-constants';
import { UpdatePasswordDTO } from '@auth/infrastructure/adaptars/primary/http/dtos/update-password.dto';
import { ValidateCodeForForgotPasswordDTO } from '@auth/infrastructure/adaptars/primary/http/dtos/validate-code-for-forgot-pass.dto';
import { ValidationError, validate } from 'class-validator';

export const validateObject = async (
  dto: object,
): Promise<ValidationError[]> => {
  return await validate(dto, {
    whitelist: true,
    forbidNonWhitelisted: true,
    stopAtFirstError: true,
  });
};

export const mockValidateCodeForForgotPasswordDTOLikeInstance = (
  overrides: Partial<ValidateCodeForForgotPasswordDTO>,
): ValidateCodeForForgotPasswordDTO => {
  const dto = new ValidateCodeForForgotPasswordDTO();
  const keys = Object.keys(overrides);

  dto.email = keys.includes('email') ? overrides.email : EmailConstants.EXEMPLE;
  dto.code = keys.includes('code') ? overrides.code : 'AAAAAA';
  return dto;
};

export const mockUpdatePasswordLikeInstance = (
  overrides: Partial<UpdatePasswordDTO> = {},
): UpdatePasswordDTO => {
  const dto = new UpdatePasswordDTO();
  const keys = Object.keys(overrides);

  dto.newPassword = keys.includes('newPassword')
    ? overrides.newPassword
    : `new-${PasswordConstants.EXEMPLE}`;
  dto.oldPassword = keys.includes('oldPassword')
    ? overrides.oldPassword
    : `old-${PasswordConstants.EXEMPLE}`;
  return dto;
};
