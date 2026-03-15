export default class CategoryConstants {
  static readonly DESCRIPTION =
    'O ID da categoria à qual o produto pertence, usado para organizar e filtrar produtos';
  static readonly EXEMPLE = '019c59b2-4485-75df-9163-c8ee30336b87';
  static readonly WRONG_EXEMPLE = 'invalid-category-id';

  // ERRORS
  static readonly ERROR_REQUIRED = 'A categoria é obrigatória';
  static readonly ERROR_STRING = 'O ID da categoria deve ser uma string';
  static readonly ERROR_INVALID = 'O ID da categoria deve ser um UUID válido';
  static readonly ERROR_NOT_FOUND = 'Categoria não encontrada';

  // Errors examples
  static readonly ERROR_REQUIRED_EXEMPLE = '';
  static readonly ERROR_STRING_EXEMPLE = 123 as any;
  static readonly ERROR_INVALID_EXEMPLE = 'invalid-category-id';
  static readonly ERROR_NOT_FOUND_EXEMPLE =
    '019c59b2-0000-0000-0000-000000000000';
}
