export default class TitleConstants {
  static readonly DESCRIPTION =
    'O título é o nome principal do produto exibido em listagens e na página de detalhes';
  static readonly EXEMPLE = 'Smartphone Samsung Galaxy S23 Ultra 256GB';
  static readonly WRONG_EXEMPLE = 'Ab';

  // LIMITS
  static readonly MIN_LENGTH = 3;
  static readonly MAX_LENGTH = 200;

  // ERRORS
  static readonly ERROR_REQUIRED = 'O título é obrigatório';
  static readonly ERROR_STRING = 'O título deve ser uma string';
  static readonly ERROR_MIN_LENGTH = 'O título deve ter no mínimo 3 caracteres';
  static readonly ERROR_MAX_LENGTH =
    'O título deve ter no máximo 200 caracteres';
  static readonly ERROR_INVALID = 'O título contém caracteres inválidos';
  static readonly ERROR_EMPTY = 'O título não pode estar vazio';
  static readonly ERROR_ONLY_SPACES = 'O título não pode conter apenas espaços';

  // Errors examples
  static readonly ERROR_REQUIRED_EXEMPLE = '';
  static readonly ERROR_STRING_EXEMPLE = 123 as any;
  static readonly ERROR_MIN_LENGTH_EXEMPLE = 'Ab';
  static readonly ERROR_MAX_LENGTH_EXEMPLE = 'a'.repeat(201);
  static readonly ERROR_INVALID_EXEMPLE = '<script>alert("xss")</script>';
  static readonly ERROR_EMPTY_EXEMPLE = '';
  static readonly ERROR_ONLY_SPACES_EXEMPLE = '     ';
}
