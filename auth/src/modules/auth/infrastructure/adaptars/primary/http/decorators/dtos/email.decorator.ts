import { EmailConstants } from '@modules/auth/domain/values-objects/email/EmailConstants';
import { applyDecorators } from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export function Email(isOptional: boolean) {
  const IsRequired = isOptional
    ? IsOptional()
    : IsNotEmpty({
        message: EmailConstants.ERROR_REQUIRED,
      });

  return applyDecorators(
    IsRequired,
    IsString({ message: EmailConstants.ERROR_STRING }),
    IsEmail({}, { message: EmailConstants.ERROR_INVALID }),
  );
}
