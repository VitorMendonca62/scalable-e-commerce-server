export default class StreetConstants {
  static readonly DESCRIPTION = 'A rua é o nome da via onde o usuário reside';

  static readonly EXEMPLE = 'Rua das Flores';
  static readonly WRONG_EXEMPLE = '';
  static readonly MAX_LENGTH = 150;
  static readonly MIN_LENGTH = 3;

  // ERRORS
  static readonly ERROR_REQUIRED = 'A rua é obrigatória';
  static readonly ERROR_STRING = 'A rua deve ser uma string';
  static readonly ERROR_INVALID = 'A rua deve ser válida';
  static readonly ERROR_TOO_LONG = 'A rua não pode ter mais de 150 caracteres';
  static readonly ERROR_TOO_SHORT = 'A rua deve ter pelo menos 3 caracteres';

  // ERROR EXAMPLES
  static readonly ERROR_REQUIRED_EXEMPLE = '';
  static readonly ERROR_STRING_EXEMPLE = 123;
  static readonly ERROR_INVALID_EXEMPLE = 'X1';
  static readonly ERROR_TOO_LONG_EXEMPLE = 'a'.repeat(151);
  static readonly ERROR_TOO_SHORT_EXEMPLE = 'AB';
}
