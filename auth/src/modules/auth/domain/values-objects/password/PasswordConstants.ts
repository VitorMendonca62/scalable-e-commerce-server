export class PasswordConstants {
  static readonly DESCRIPTION =
    'A senha, que será criptografada assim que entra no sistema é utilizada para entrar no sistema. Ela deve conter um caracter especial, um número uma letra maiúscula e outra minúscula.';

  static readonly EXEMPLE = '$Vh1234567';
  static readonly WRONG_EXEMPLE = 'weak123';
  static readonly MIN_LENGTH = 8;
  static readonly MIN_LENGTH_EXEMPLE = 'abc';
  static readonly WEAK_EXEMPLE = 'adwawdawdwad';

  // ERRORS
  static readonly ERROR_REQUIRED = 'A senha é obrigatória';
  static readonly ERROR_INVALID = 'A senha deve ser uma string válida';
  static readonly ERROR_MIN_LENGTH =
    'A senha está está muito curta. O mínimo são 8 caracteres';
  static readonly ERROR_WEAK_PASSWORD = 'A senha está muito fraca';
}
