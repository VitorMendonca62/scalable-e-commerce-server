export class NumberConstants {
  static readonly DESCRIPTION = 'O número é a identificação numérica do endereço';

  static readonly EXEMPLE = '123';
  static readonly WRONG_EXEMPLE = '';
  static readonly MAX_LENGTH = 10;
  static readonly MIN_LENGTH = 1;

  // ERRORS
  static readonly ERROR_REQUIRED = 'O número é obrigatório';
  static readonly ERROR_STRING = 'O número deve ser uma string';
  static readonly ERROR_INVALID = 'O número deve ser válido';
  static readonly ERROR_TOO_LONG =
    'O número não pode ter mais de 10 caracteres';

  // ERROR EXAMPLES
  static readonly ERROR_REQUIRED_EXEMPLE = '';
  static readonly ERROR_STRING_EXEMPLE = 123;
  static readonly ERROR_INVALID_EXEMPLE = 'ABC';
  static readonly ERROR_TOO_LONG_EXEMPLE = '12345678901';
}

