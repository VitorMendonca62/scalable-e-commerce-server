export default class PriceConstants {
  static readonly DESCRIPTION =
    'O preço representa o valor monetário do produto em centavos para evitar problemas com arredondamento';
  static readonly EXEMPLE = 9990;
  static readonly WRONG_EXEMPLE = -100;

  // LIMITS
  static readonly MIN_VALUE = 1;
  static readonly MAX_VALUE = 99999999;

  // ERRORS
  static readonly ERROR_REQUIRED = 'O preço é obrigatório';
  static readonly ERROR_NUMBER = 'O preço deve ser um número';
  static readonly ERROR_INTEGER =
    'O preço deve ser um número inteiro (em centavos)';
  static readonly ERROR_MIN_VALUE = 'O preço deve ser maior que zero';
  static readonly ERROR_MAX_VALUE =
    'O preço não pode ultrapassar R$ 999.999,99';
  static readonly ERROR_INVALID = 'Valor de preço inválido';
  static readonly ERROR_NEGATIVE = 'O preço não pode ser negativo';

  // Errors examples
  static readonly ERROR_REQUIRED_EXEMPLE = undefined;
  static readonly ERROR_NUMBER_EXEMPLE = 'noventa e nove reais' as any;
  static readonly ERROR_INTEGER_EXEMPLE = 99.9;
  static readonly ERROR_MIN_VALUE_EXEMPLE = 0;
  static readonly ERROR_MAX_VALUE_EXEMPLE = 100000000;
  static readonly ERROR_INVALID_EXEMPLE = NaN;
  static readonly ERROR_NEGATIVE_EXEMPLE = -100;
}
