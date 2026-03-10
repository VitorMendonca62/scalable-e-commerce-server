export default class DescriptionConstants {
  static readonly DESCRIPTION =
    'A descrição fornece informações detalhadas sobre o produto em formato markdown para auxiliar os compradores na decisão de compra';
  static readonly EXEMPLE =
    '#Este é um produto de alta qualidade com excelente acabamento e durabilidade comprovada.';
  static readonly WRONG_EXEMPLE = 'ab';

  // LIMITS
  static readonly MIN_LENGTH = 10;
  static readonly MAX_LENGTH = 5000;

  // ERRORS
  static readonly ERROR_REQUIRED = 'A descrição é obrigatória';
  static readonly ERROR_STRING = 'A descrição deve ser uma string';
  static readonly ERROR_MIN_LENGTH =
    'A descrição deve ter no mínimo 10 caracteres';
  static readonly ERROR_MAX_LENGTH =
    'A descrição deve ter no máximo 5000 caracteres';
  static readonly ERROR_INVALID = 'A descrição contém caracteres inválidos';

  // Errors examples
  static readonly ERROR_REQUIRED_EXEMPLE = '';
  static readonly ERROR_STRING_EXEMPLE = 123 as any;
  static readonly ERROR_MIN_LENGTH_EXEMPLE = 'Produto';
  static readonly ERROR_MAX_LENGTH_EXEMPLE = 'a'.repeat(5001);
  static readonly ERROR_INVALID_EXEMPLE = '<script>alert("xss")</script>';
}
