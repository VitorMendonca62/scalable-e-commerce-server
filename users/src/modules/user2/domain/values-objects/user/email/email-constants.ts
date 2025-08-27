export class EmailConstants {
  static readonly DESCRIPTION =
    'O email serve como identificador único de usuário e utiliza-se para entrar no sistema';

  static readonly EXEMPLE = 'vitorqueiroz325@gmail.com';
  static readonly WRONG_EXEMPLE = 'invalid.email';

  // ERRORS
  static readonly ERROR_REQUIRED = 'O email é obrigatório';
  static readonly ERROR_STRING = 'O email deve ser uma string';
  static readonly ERROR_INVALID = 'O email deve ser válido';
  static readonly ERROR_ALREADY_EXISTS =
    'Esse email já está sendo utilizado. Tente outro';

  // Errors exemples
  static readonly ERROR_REQUIRED_EXEMPLE = '';
  static readonly ERROR_STRING_EXEMPLE = 123;
  static readonly ERROR_INVALID_EXEMPLE = 'email-invalido';
  static readonly ERROR_ALREADY_EXISTS_EXEMPLE = 'vitorqueiroz325@gmail.com';
}
