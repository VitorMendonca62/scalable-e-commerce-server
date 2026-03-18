export default class CategorySlugConstants {
  static readonly DESCRIPTION =
    'O slug da categoria usado em URLs, deve conter apenas letras minúsculas, números e hífens';
  static readonly EXEMPLE = 'eletronicos';
  static readonly WRONG_EXEMPLE = 'Eletrônicos & Informática';

  static readonly REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  // ERRORS
  static readonly ERROR_REQUIRED = 'O slug da categoria é obrigatório';
  static readonly ERROR_STRING = 'O slug da categoria deve ser uma string';
  static readonly ERROR_MIN_LENGTH =
    'O slug da categoria deve ter no mínimo 3 caracteres';
  static readonly ERROR_MAX_LENGTH =
    'O slug da categoria deve ter no máximo 150 caracteres';
  static readonly ERROR_INVALID_FORMAT =
    'O slug deve conter apenas letras minúsculas, números e hífens';

  // Errors examples
  static readonly ERROR_REQUIRED_EXEMPLE = '';
  static readonly ERROR_STRING_EXEMPLE = 123 as any;
  static readonly ERROR_MIN_LENGTH_EXEMPLE = 'ab';
  static readonly ERROR_MAX_LENGTH_EXEMPLE = 'a'.repeat(151);
  static readonly ERROR_INVALID_FORMAT_EXEMPLE = 'Eletrônicos & Informática';
}
