export default class CategoryNameConstants {
  static readonly DESCRIPTION =
    'O nome da categoria usado para identificação e exibição no sistema';
  static readonly EXEMPLE = 'Eletrônicos';
  static readonly WRONG_EXEMPLE = 'AB';

  // ERRORS
  static readonly ERROR_REQUIRED = 'O nome da categoria é obrigatório';
  static readonly ERROR_STRING = 'O nome da categoria deve ser uma string';
  static readonly ERROR_MIN_LENGTH =
    'O nome da categoria deve ter no mínimo 3 caracteres';
  static readonly ERROR_MAX_LENGTH =
    'O nome da categoria deve ter no máximo 100 caracteres';

  // Errors examples
  static readonly ERROR_REQUIRED_EXEMPLE = '';
  static readonly ERROR_STRING_EXEMPLE = 123 as any;
  static readonly ERROR_MIN_LENGTH_EXEMPLE = 'AB';
  static readonly ERROR_MAX_LENGTH_EXEMPLE = 'A'.repeat(101);
}
