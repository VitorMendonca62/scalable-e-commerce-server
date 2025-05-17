import EmailVO from '@modules/auth/domain/values-objects/email.vo';
import { applyDecorators } from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export function Email(isOptional: boolean) {
  const IsRequired = isOptional
    ? IsOptional()
    : IsNotEmpty({
        message: EmailVO.ERROR_REQUIRED,
      });

  return applyDecorators(
    IsRequired,
    IsEmail({}, { message: EmailVO.ERROR_INVALID }),
  );
}
