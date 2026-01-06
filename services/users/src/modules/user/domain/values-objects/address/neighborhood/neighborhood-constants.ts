export class NeighborhoodConstants {
  static readonly DESCRIPTION =
    'O bairro é a região ou área específica da cidade onde o usuário reside';

  static readonly EXEMPLE = 'Vila Madalena';
  static readonly WRONG_EXEMPLE = '';
  static readonly MAX_LENGTH = 100;
  static readonly MIN_LENGTH = 2;

  // ERRORS
  static readonly ERROR_REQUIRED = 'O bairro é obrigatório';
  static readonly ERROR_STRING = 'O bairro deve ser uma string';
  static readonly ERROR_INVALID = 'O bairro deve ser válido';
  static readonly ERROR_TOO_LONG =
    'O bairro não pode ter mais de 100 caracteres';
  static readonly ERROR_TOO_SHORT = 'O bairro deve ter pelo menos 2 caracteres';

  // ERROR EXAMPLES
  static readonly ERROR_REQUIRED_EXEMPLE = '';
  static readonly ERROR_STRING_EXEMPLE = 123;
  static readonly ERROR_INVALID_EXEMPLE = 'X1';
  static readonly ERROR_TOO_LONG_EXEMPLE = 'a'.repeat(101);
  static readonly ERROR_TOO_SHORT_EXEMPLE = 'A';
}
