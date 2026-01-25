export default class NameConstants {
  static readonly DESCRIPTION =
    'O nome completo do usuário. Serve como informação auxiliar para o sistema';

  static readonly EXEMPLE = 'Vitor Hugo Mendonça de Queiroz';
  static readonly WRONG_EXEMPLE = 'Vi';
  static readonly MIN_LENGTH = 3;
  static readonly MIN_LENGTH_EXEMPLE = 'ab';

  // ERRORS
  static readonly ERROR_REQUIRED = 'O nome completo é obrigatório';
  static readonly ERROR_STRING = 'O nome completo deve ser uma string válida';
  static readonly ERROR_MIN_LENGTH =
    'O nome completo está muito curto. O mínimo são 3 caracteres';

  // Errors exemples
  static readonly ERROR_REQUIRED_EXEMPLE = '';
  static readonly ERROR_STRING_EXEMPLE = 12345 as any;
  static readonly ERROR_MIN_LENGTH_EXEMPLE = 'Vi';
}
