export class PhoneNumberConstants {
  static readonly DESCRIPTION =
    'O número de telefone serve como informação auxiliar para o sistema. Deve ser um número válido no Brasil!.';

  static readonly EXEMPLE = '+5581999999999';
  static readonly WRONG_EXEMPLE = '+15551234567';
  static readonly LENGTH = 14;

  // ERRORS
  static readonly ERROR_LENGTH = 'O telefone está no tamanho incorreto';
  static readonly ERROR_REQUIRED = 'O telefone é obrigatório';
  static readonly ERROR_INVALID = 'O telefone deve ser válido do Brasil';
  static readonly ERROR_STRING = 'O telefone deve ser uma string';

  // Errors exemple
  static readonly ERROR_LENGTH_EXEMPLE = '+55819999999';
  static readonly ERROR_REQUIRED_EXEMPLE = '';
  static readonly ERROR_INVALID_EXEMPLE = '+15551234567';
  static readonly ERROR_STRING_EXEMPLE = 12345678901234;
}
