import { applyDecorators } from '@nestjs/common';
import {
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export function Password(isStrongPassword: boolean) {
  const decorators = [];

  if (isStrongPassword) {
    decorators.push(
      IsStrongPassword(
        {
          minLowercase: 1,
          minLength: 8,
          minSymbols: 1,
          minUppercase: 1,
          minNumbers: 1,
        },
        {
          message: 'A senha está muito fraca',
        },
      ),
    );
  }

  return applyDecorators(
    IsNotEmpty({
      message: 'A senha é obrigatória',
    }),
    IsString({ message: 'A senha deve ser uma string válida' }),
    MinLength(8, {
      message: 'A senha está está muito curta. O mínimo são 8 caracteres',
    }),
    ...decorators,
  );
}
