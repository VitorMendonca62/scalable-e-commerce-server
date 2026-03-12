import { PaymentTypes } from '@product/domain/enums/payments-types.enum';

export default class PaymentsConstants {
  static readonly DESCRIPTION =
    'Os métodos de pagamento aceitos para a compra do produto';
  static readonly EXEMPLE = [PaymentTypes.PIX];
  static readonly WRONG_EXEMPLE = ['invalid_payment', 'cash'];

  // ERRORS
  static readonly ERROR_REQUIRED =
    'Pelo menos um método de pagamento é obrigatório';
  static readonly ERROR_ARRAY = 'Os métodos de pagamento devem ser um array';
  static readonly ERROR_INVALID_TYPE =
    'Tipo de pagamento inválido. Tipos aceitos: pix, cartão de crédito, cartão de débito, boleto';
  static readonly ERROR_MIN_LENGTH =
    'É necessário pelo menos 1 método de pagamento';
  static readonly ERROR_EMPTY = 'A lista de pagamentos não pode estar vazia';
  static readonly ERROR_DUPLICATE =
    'Não é permitido duplicar métodos de pagamento';

  // Errors examples
  static readonly ERROR_REQUIRED_EXEMPLE = [];
  static readonly ERROR_ARRAY_EXEMPLE = 'not-an-array' as any;
  static readonly ERROR_INVALID_TYPE_EXEMPLE = [
    'invalid_payment',
    'cash',
  ] as any;
  static readonly ERROR_MIN_LENGTH_EXEMPLE = [];
  static readonly ERROR_EMPTY_EXEMPLE = [];
  static readonly ERROR_DUPLICATE_EXEMPLE = ['pix', 'pix', 'credit_card'];
}
