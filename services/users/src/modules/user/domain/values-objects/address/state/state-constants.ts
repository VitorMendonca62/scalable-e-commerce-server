import { BrazilStates } from '@modules/user/domain/enums/brazil-ufs.enum';

export default class StateConstants {
  static readonly DESCRIPTION =
    'O estado é a unidade federativa ou província onde o usuário reside';

  static readonly EXEMPLE = BrazilStates.PE;
  static readonly WRONG_EXEMPLE = '';
  static readonly LENGTH = 2;
  // ERRORS
  static readonly ERROR_REQUIRED = 'O estado é obrigatório';
  static readonly ERROR_STRING = 'O estado deve ser uma string';
  static readonly ERROR_INVALID = 'O estado deve ser válido';
  static readonly ERROR_LENGTH = 'O estado deve ter pelo menos 2 caracteres';
  static readonly ERROR_NOT_BRAZIL_STATE =
    'O estado deve ser uma UF do Brasil. ( Ex.: SP )';

  // ERROR EXAMPLES
  static readonly ERROR_REQUIRED_EXEMPLE = '';
  static readonly ERROR_STRING_EXEMPLE = 123;
  static readonly ERROR_INVALID_EXEMPLE = 'X1';
  static readonly ERROR_TOO_LONG_EXEMPLE = 'a'.repeat(51);
  static readonly ERROR_TOO_SHORT_EXEMPLE = 'A';
}
