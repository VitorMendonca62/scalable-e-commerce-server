export default class AvatarConstants {
  static readonly DESCRIPTION =
    'O avatar é uma imagem de perfil do usuário que pode ser uma URL ou um identificador de imagem';

  static readonly EXEMPLE = 'https://example.com/avatar.jpg';
  static readonly WRONG_EXEMPLE = 'invalid-avatar-url';
  static readonly MAX_LENGTH = 500;

  // ERRORS
  static readonly ERROR_REQUIRED = 'O avatar é obrigatório';
  static readonly ERROR_STRING = 'O avatar deve ser uma string';
  static readonly ERROR_INVALID = 'O avatar deve ser uma URL válida';
  static readonly ERROR_TOO_LONG =
    'O avatar não pode ter mais de 500 caracteres';

  // ERROR EXAMPLES
  static readonly ERROR_REQUIRED_EXEMPLE = '';
  static readonly ERROR_STRING_EXEMPLE = 123 as any;
  static readonly ERROR_INVALID_EXEMPLE = 'not-a-valid-url';
  static readonly ERROR_TOO_LONG_EXEMPLE =
    'https://example.com/' + 'a'.repeat(501);
}
