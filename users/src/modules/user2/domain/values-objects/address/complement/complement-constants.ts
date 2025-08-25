export class ComplementConstants {
  static readonly DESCRIPTION =
    'O complemento é uma informação adicional para localizar o endereço (apartamento, sala, etc.)';

  static readonly EXEMPLE = 'Apto 101';
  static readonly WRONG_EXEMPLE = 'a'.repeat(201);
  static readonly MAX_LENGTH = 200;

  // ERRORS
  static readonly ERROR_STRING = 'O complemento deve ser uma string';
  static readonly ERROR_TOO_LONG =
    'O complemento não pode ter mais de 200 caracteres';
  static readonly ERROR_INVALID = 'O complemento deve ser válido';

  // ERROR EXAMPLES
  static readonly ERROR_STRING_EXEMPLE = 123;
  static readonly ERROR_TOO_LONG_EXEMPLE = 'a'.repeat(201);
}
