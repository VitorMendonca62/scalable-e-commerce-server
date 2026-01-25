export class PasswordConstants {
  static readonly DESCRIPTION =
    'A senha, que será criptografada assim que entra no sistema é utilizada para entrar no sistema. Ela deve conter um caracter especial, um número uma letra maiúscula e outra minúscula.';

  static readonly EXEMPLE = '$Vh1234567';
  static readonly WRONG_EXEMPLE = 'weak123';
  static readonly MIN_LENGTH = 8;
  static readonly MIN_LENGTH_EXEMPLE = 'abc';
  static readonly WEAK_EXEMPLE = 'adwawdawdwad';

  static readonly MIN_LOWERCASE = 1;
  static readonly MIN_SYMBOLS = 1;
  static readonly MIN_UPPERCASE = 1;
  static readonly MIN_NUMBERS = 1;
  static readonly STRONG_OPTIONS = {
    minLowercase: this.MIN_LOWERCASE,
    minLength: this.MIN_LENGTH,
    minSymbols: this.MIN_SYMBOLS,
    minUppercase: this.MIN_UPPERCASE,
    minNumbers: this.MIN_NUMBERS,
  };

  // ERRORS
  static readonly ERROR_REQUIRED = 'A senha é obrigatória.';
  static readonly ERROR_STRING = 'A senha deve ser uma string válida.';
  static readonly ERROR_MIN_LENGTH =
    'A senha está muito curta. O mínimo são 8 caracteres.';
  static readonly ERROR_WEAK_PASSWORD =
    'A senha está muito fraca. Ela deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial.';
}
