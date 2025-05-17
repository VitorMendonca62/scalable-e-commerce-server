import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { applyDecorators } from '@nestjs/common';
import UsernameVO from '@modules/auth/domain/values-objects/username.vo';

export function Username(isOptional: boolean | undefined) {
  const IsRequiredOrNo = isOptional
    ? IsOptional()
    : IsNotEmpty({
        message: UsernameVO.ERROR_REQUIRED,
      });

  return applyDecorators(
    IsRequiredOrNo,
    IsString({ message: UsernameVO.ERROR_INVALID }),
    MinLength(UsernameVO.MIN_LENGTH, {
      message: UsernameVO.ERROR_MIN_LENGTH,
    }),
    Matches(/^\S+$/, { message: UsernameVO.ERROR_NO_SPACES }),
  );
}
