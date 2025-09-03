export class IDConstants {
  static readonly DESCRIPTION =
    'O ID serve como identificador único universal e é utilizado para identificar entidades no sistema';

  static readonly EXEMPLE = '123e4567-e89b-12d3-a456-426614174000';
  static readonly WRONG_EXEMPLE = 'invalid-uuid-format';

  // ERRORS
  static readonly ERROR_REQUIRED = 'O id é obrigatório';
  static readonly ERROR_STRING = 'O id deve ser uma string válida';
  static readonly ERROR_INVALID = 'O id deve estar em um formato válido (ex: 123e4567-e89b-12d3-a456-426614174000)';
  static readonly ERROR_NOT_FOUND = 'id não encontrado';

  // Errors exemples
  static readonly ERROR_REQUIRED_EXEMPLE = '';
  static readonly ERROR_STRING_EXEMPLE = 12345;
  static readonly ERROR_INVALID_EXEMPLE = 'invalid-id-format';
  static readonly ERROR_NOT_FOUND_EXEMPLE = '00000000-0000-0000-0000-000000000000';
}
