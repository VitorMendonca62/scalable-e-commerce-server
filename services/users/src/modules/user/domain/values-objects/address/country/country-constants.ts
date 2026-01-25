export default class CountryConstants {
  static readonly DESCRIPTION =
    'O país é o local onde o usuário reside ou está localizado';

  static readonly EXEMPLE = 'Brasil';
  static readonly WRONG_EXEMPLE = '';
  static readonly MAX_LENGTH = 100;
  static readonly MIN_LENGTH = 2;

  // ERRORS
  static readonly ERROR_REQUIRED = 'O país é obrigatório';
  static readonly ERROR_STRING = 'O país deve ser uma string';
  static readonly ERROR_INVALID = 'O país deve ser válido';
  static readonly ERROR_TOO_LONG = 'O país não pode ter mais de 100 caracteres';
  static readonly ERROR_TOO_SHORT = 'O país deve ter pelo menos 2 caracteres';

  // ERROR EXAMPLES
  static readonly ERROR_REQUIRED_EXEMPLE = '';
  static readonly ERROR_STRING_EXEMPLE = 123;
  static readonly ERROR_INVALID_EXEMPLE = 'X1';
  static readonly ERROR_TOO_LONG_EXEMPLE = 'a'.repeat(101);
  static readonly ERROR_TOO_SHORT_EXEMPLE = 'A';
}
