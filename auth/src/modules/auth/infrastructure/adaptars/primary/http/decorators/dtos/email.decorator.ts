import { EmailConstants } from '@modules/auth/domain/values-objects/email/email-constants';
import { applyDecorators } from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export function Email() {
  return applyDecorators(
    IsNotEmpty({
      message: EmailConstants.ERROR_REQUIRED,
    }),
    IsString({ message: EmailConstants.ERROR_STRING }),
    IsEmail({}, { message: EmailConstants.ERROR_INVALID }),
  );
}
