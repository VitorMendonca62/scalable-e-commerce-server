import {
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { applyDecorators } from '@nestjs/common';

export function PhoneNumber(isOptional: boolean) {
  const IsRequired = isOptional
    ? IsOptional()
    : IsNotEmpty({
        message: 'O telefone é obrigatório',
      });

  return applyDecorators(
    IsRequired,
    IsPhoneNumber('BR', { message: 'O telefone deve ser válido do Brasil' }),
    IsString({ message: 'O telefone deve ser uma string' }),
  );
}
