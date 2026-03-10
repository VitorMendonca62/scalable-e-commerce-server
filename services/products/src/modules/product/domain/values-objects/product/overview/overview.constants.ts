export default class OverviewConstants {
  static readonly DESCRIPTION =
    'O overview fornece um resumo executivo e informações principais sobre o produto para visualização rápida';
  static readonly EXEMPLE =
    'Smartphone de última geração com câmera de 108MP, 5G e bateria de longa duração';
  static readonly WRONG_EXEMPLE = 'abc';

  // LIMITS
  static readonly MIN_LENGTH = 10;
  static readonly MAX_LENGTH = 500;

  // ERRORS
  static readonly ERROR_REQUIRED = 'O overview é obrigatório';
  static readonly ERROR_STRING = 'O overview deve ser uma string';
  static readonly ERROR_MIN_LENGTH =
    'O overview deve ter no mínimo 10 caracteres';
  static readonly ERROR_MAX_LENGTH =
    'O overview deve ter no máximo 500 caracteres';
  static readonly ERROR_INVALID = 'O overview contém caracteres inválidos';
  static readonly ERROR_EMPTY = 'O overview não pode estar vazio';

  // Errors examples
  static readonly ERROR_REQUIRED_EXEMPLE = '';
  static readonly ERROR_STRING_EXEMPLE = 123 as any;
  static readonly ERROR_MIN_LENGTH_EXEMPLE = 'Produto';
  static readonly ERROR_MAX_LENGTH_EXEMPLE = 'a'.repeat(501);
  static readonly ERROR_INVALID_EXEMPLE = '<script>alert("xss")</script>';
  static readonly ERROR_EMPTY_EXEMPLE = '   ';
}
