export default class ActiveConstants {
  static readonly DESCRIPTION =
    'Indica se o produto está ativo e disponível para venda no sistema';
  static readonly EXEMPLE = true;
  static readonly WRONG_EXEMPLE = 'true' as any;

  // ERRORS
  static readonly ERROR_REQUIRED = 'O status ativo é obrigatório';
  static readonly ERROR_BOOLEAN =
    'O status ativo deve ser um valor booleano (true ou false)';
  static readonly ERROR_INVALID = 'Valor inválido para o status ativo';

  // Errors examples
  static readonly ERROR_REQUIRED_EXEMPLE = undefined;
  static readonly ERROR_BOOLEAN_EXEMPLE = 'truae' as any;
  static readonly ERROR_INVALID_EXEMPLE = 1 as any;
}
