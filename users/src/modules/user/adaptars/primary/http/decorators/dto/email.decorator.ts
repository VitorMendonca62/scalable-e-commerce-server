import { applyDecorators } from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export function Email(isOptional: boolean) {
  const IsRequired = isOptional
    ? IsOptional()
    : IsNotEmpty({
        message: 'O email é obrigatório',
      });

  return applyDecorators(
    IsRequired,
    IsEmail({}, { message: 'O email tem que ser válido' }),
  );
}
