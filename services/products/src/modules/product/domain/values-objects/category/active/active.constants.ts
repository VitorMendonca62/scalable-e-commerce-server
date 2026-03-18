export default class CategoryActiveConstants {
  static readonly DESCRIPTION =
    'Define se a categoria está ativa e disponível para uso no sistema';
  static readonly EXEMPLE = true;
  static readonly WRONG_EXEMPLE = 'true';

  // ERRORS
  static readonly ERROR_REQUIRED = 'O status da categoria é obrigatório';
  static readonly ERROR_BOOLEAN =
    'O status da categoria deve ser verdadeiro ou falso';

  // Errors examples
  static readonly ERROR_REQUIRED_EXEMPLE = undefined;
  static readonly ERROR_BOOLEAN_EXEMPLE = 'true' as any;
}
