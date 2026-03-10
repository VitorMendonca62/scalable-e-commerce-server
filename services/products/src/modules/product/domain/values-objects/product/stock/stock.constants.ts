export default class StockConstants {
  static readonly DESCRIPTION =
    'A quantidade de unidades disponíveis do produto em estoque';
  static readonly EXEMPLE = 50;
  static readonly WRONG_EXEMPLE = -5;

  // LIMITS
  static readonly MIN_VALUE = 0;
  static readonly MAX_VALUE = 999999;

  // ERRORS
  static readonly ERROR_REQUIRED = 'A quantidade em estoque é obrigatória';
  static readonly ERROR_NUMBER = 'O estoque deve ser um número';
  static readonly ERROR_INTEGER = 'O estoque deve ser um número inteiro';
  static readonly ERROR_MIN_VALUE = 'O estoque não pode ser negativo';
  static readonly ERROR_MAX_VALUE =
    'O estoque não pode ultrapassar 999.999 unidades';
  static readonly ERROR_INVALID = 'Valor de estoque inválido';

  // Errors examples
  static readonly ERROR_REQUIRED_EXEMPLE = undefined;
  static readonly ERROR_NUMBER_EXEMPLE = 'cinquenta' as any;
  static readonly ERROR_INTEGER_EXEMPLE = 10.5;
  static readonly ERROR_MIN_VALUE_EXEMPLE = -5;
  static readonly ERROR_MAX_VALUE_EXEMPLE = 1000000;
  static readonly ERROR_INVALID_EXEMPLE = NaN;
}
