export class PostalCodeConstants {
  static readonly DESCRIPTION =
    'O CEP é o código de endereçamento postal que identifica a localização';

  static readonly EXEMPLE = '01310100';
  static readonly WRONG_EXEMPLE = '12345';
  static readonly LENGTH = 8;

  // ERRORS
  static readonly ERROR_REQUIRED = 'O CEP é obrigatório';
  static readonly ERROR_STRING = 'O CEP deve ser uma string';
  static readonly ERROR_INVALID = 'O CEP deve estar no formato 0000000';
  static readonly ERROR_LENGTH = 'O CEP deve ter 8 caracteres';

  // ERROR EXAMPLES
  static readonly ERROR_REQUIRED_EXEMPLE = '';
  static readonly ERROR_STRING_EXEMPLE = 123;
  static readonly ERROR_INVALID_EXEMPLE = '12345-67';
  static readonly ERROR_LENGTH_EXEMPLE = '1234589';
}
