export class UsernameConstants {
  static readonly DESCRIPTION =
    'O apelido serve como identificador único de usuário e é utilizado para o usuário ser identificado no sistema';

  static readonly EXEMPLE = 'vitormendonca62';
  static readonly WRONG_EXEMPLE = 'us er';
  static readonly MIN_LENGTH = 3;
  static readonly MIN_LENGTH_EXEMPLE = 'ab';

  // ERRORS
  static readonly ERROR_REQUIRED = 'O username é obrigatório';
  static readonly ERROR_INVALID = 'O username deve ser uma string válida';
  static readonly ERROR_MIN_LENGTH =
    'O username está muito curto. O mínimo são 3 caracteres';
  static readonly ERROR_NO_SPACES = 'O username não pode conter com espaços.';
  static readonly ERROR_ALREADY_EXISTS =
    'Esse username já está sendo utilizado. Tente outro';
}
