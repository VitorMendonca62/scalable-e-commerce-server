export default class CityConstants {
  static readonly DESCRIPTION = 'A cidade é o município onde o usuário reside';

  static readonly EXEMPLE = 'São Paulo';
  static readonly WRONG_EXEMPLE = '';
  static readonly MAX_LENGTH = 100;
  static readonly MIN_LENGTH = 2;

  // ERRORS
  static readonly ERROR_REQUIRED = 'A cidade é obrigatória';
  static readonly ERROR_STRING = 'A cidade deve ser uma string';
  static readonly ERROR_INVALID = 'A cidade deve ser válida';
  static readonly ERROR_TOO_LONG =
    'A cidade não pode ter mais de 100 caracteres';
  static readonly ERROR_TOO_SHORT = 'A cidade deve ter pelo menos 2 caracteres';

  // ERROR EXAMPLES
  static readonly ERROR_REQUIRED_EXEMPLE = '';
  static readonly ERROR_STRING_EXEMPLE = 123;
  static readonly ERROR_INVALID_EXEMPLE = 'X1';
  static readonly ERROR_TOO_LONG_EXEMPLE = 'a'.repeat(101);
  static readonly ERROR_TOO_SHORT_EXEMPLE = 'A';
}
