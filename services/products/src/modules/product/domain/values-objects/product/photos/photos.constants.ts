export default class PhotosConstants {
  static readonly DESCRIPTION =
    'As fotos são base64 das imagens do produto que serão exibidas na página de detalhes';
  static readonly EXEMPLE = ['T2zDoSwgbXVuZG8h', 'T2zDoSwgbXVuZG8h'];
  static readonly WRONG_EXEMPLE = ['not-blob'];

  // ERRORS
  static readonly ERROR_REQUIRED = 'Pelo menos uma foto é obrigatória';
  static readonly ERROR_ARRAY = 'As fotos devem ser um array';
  static readonly ERROR_INVALID_URL = 'Todas as fotos devem ser base64 válios';
  static readonly ERROR_MIN_LENGTH = 'É necessário pelo menos 1 foto';
  static readonly ERROR_MAX_LENGTH = 'O máximo de fotos permitido é 10';
  static readonly ERROR_INVALID_FORMAT =
    'As fotos devem estar nos formatos: jpg, jpeg, png, webp';

  // Errors examples
  static readonly ERROR_REQUIRED_EXEMPLE = [];
  static readonly ERROR_ARRAY_EXEMPLE = 'not-an-array' as any;
  static readonly ERROR_INVALID_URL_EXEMPLE = ['invalid-url', 'not-a-url'];
  static readonly ERROR_MIN_LENGTH_EXEMPLE = [];
  static readonly ERROR_MAX_LENGTH_EXEMPLE = Array(11).fill(
    'https://example.com/photo.jpg',
  );
  static readonly ERROR_INVALID_FORMAT_EXEMPLE = [
    'https://example.com/photo.pdf',
  ];
}
