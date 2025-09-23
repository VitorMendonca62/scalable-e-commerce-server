import { EmailConstants } from '@modules/user/domain/values-objects/user/constants';
import { applyDecorators } from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export function Email(required: boolean) {
  const IsRequired = required
    ? IsNotEmpty({
        message: EmailConstants.ERROR_REQUIRED,
      })
    : IsOptional();

  return applyDecorators(
    IsRequired,
    IsString({ message: EmailConstants.ERROR_STRING }),
    IsEmail({}, { message: EmailConstants.ERROR_INVALID }),
  );
}
