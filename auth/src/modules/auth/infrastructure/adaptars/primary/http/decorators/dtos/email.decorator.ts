import { EmailConstants } from '@modules/auth/domain/values-objects/email/EmailConstants';
import { applyDecorators } from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export function Email(isOptional: boolean) {
  const IsRequired = isOptional
    ? IsOptional()
    : IsNotEmpty({
        message: EmailConstants.ERROR_REQUIRED,
      });

  return applyDecorators(
    IsRequired,
    IsEmail({}, { message: EmailConstants.ERROR_INVALID }),
  );
}
