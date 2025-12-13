import { applyDecorators } from '@nestjs/common';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';

export function Roles() {
  return applyDecorators(
    IsNotEmpty({
      message: 'As permissões são obrigátorias.',
    }),
    IsArray({
      message: 'As permissões devem ser uma lista.',
    }),
    ArrayNotEmpty({
      message: 'As permissões devem ser uma lista não vazia.',
    }),
    IsString({
      each: true,
      message: 'As permissões devem ser uma lista de string.',
    }),
  );
}
