import { ValidationObjectFactory } from '@product/infrastructure/helpers/dto-helper';
import CreateRatingDTO from './create-rating.dto';

describe('CreateRatingDTO', () => {
  const createDTO = (value?: number) => {
    const dto = new CreateRatingDTO();
    if (value !== undefined) {
      dto.value = value;
    }
    return dto;
  };

  const createDTOWithExtras = (overrides?: Partial<CreateRatingDTO>) => {
    const dto = createDTO(4);
    if (overrides) {
      Object.assign(dto, overrides);
    }
    return dto;
  };

  it('should success validation when value is valid', async () => {
    const errors = await ValidationObjectFactory.validateObject(createDTO(4));

    expect(errors).toHaveLength(0);
  });

  it('should return error when value is less than 1', async () => {
    const errors = await ValidationObjectFactory.validateObject(createDTO(0));

    expect(errors.length).toBeGreaterThan(0);
    const fieldError = errors.find((err) => err.property === 'value');
    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.min).toBe(
      'O valor da avaliação deve ser no mínimo 1',
    );
  });

  it('should return error when value is greater than 5', async () => {
    const errors = await ValidationObjectFactory.validateObject(createDTO(6));

    expect(errors.length).toBeGreaterThan(0);
    const fieldError = errors.find((err) => err.property === 'value');
    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.max).toBe(
      'O valor da avaliação deve ser no máximo 5',
    );
  });

  it('should return error when value is not integer', async () => {
    const errors = await ValidationObjectFactory.validateObject(createDTO(3.5));

    expect(errors.length).toBeGreaterThan(0);
    const fieldError = errors.find((err) => err.property === 'value');
    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.isInt).toBe(
      'O valor da avaliação deve ser um inteiro',
    );
  });

  it('should return error when value is missing', async () => {
    const errors = await ValidationObjectFactory.validateObject(createDTO());

    expect(errors.length).toBeGreaterThan(0);
    const fieldError = errors.find((err) => err.property === 'value');
    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.isNotEmpty).toBe(
      'O valor da avaliação é obrigatório',
    );
  });

  it('should allow empty comment and images when not provided', async () => {
    const errors = await ValidationObjectFactory.validateObject(createDTO(4));

    expect(errors).toHaveLength(0);
  });

  it('should validate comment and images when provided', async () => {
    const dto = createDTOWithExtras({
      comment: 'Produto excelente',
      images: ['aW1hZ2Ux'],
    });

    const errors = await ValidationObjectFactory.validateObject(dto);

    expect(errors).toHaveLength(0);
  });

  it('should return error when images exceed maximum', async () => {
    const dto = createDTOWithExtras({
      images: ['aW1hZ2Ux', 'aW1hZ2Uy', 'aW1hZ2Uz'],
    });

    const errors = await ValidationObjectFactory.validateObject(dto);

    expect(errors.length).toBeGreaterThan(0);
    const fieldError = errors.find((err) => err.property === 'images');
    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.arrayMaxSize).toBe(
      'O máximo de imagens permitido é 2',
    );
  });

  it('should return error when comment is not string', async () => {
    const dto = createDTOWithExtras({
      comment: 123 as any,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);

    expect(errors.length).toBeGreaterThan(0);
    const fieldError = errors.find((err) => err.property === 'comment');
    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.isString).toBe(
      'O comentário deve ser um texto',
    );
  });

  it('should return error when images is not array', async () => {
    const dto = createDTOWithExtras({
      images: 'not-array' as any,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);

    expect(errors.length).toBeGreaterThan(0);
    const fieldError = errors.find((err) => err.property === 'images');
    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.isArray).toBe(
      'As imagens devem ser um array',
    );
  });

  it('should return error when images contains non-string items', async () => {
    const dto = createDTOWithExtras({
      images: ['aW1hZ2Ux', 123 as any],
    });

    const errors = await ValidationObjectFactory.validateObject(dto);

    expect(errors.length).toBeGreaterThan(0);
    const fieldError = errors.find((err) => err.property === 'images');
    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.isString).toBe(
      'As imagens devem ser base64',
    );
  });

  it('should accept images when base64 is valid', async () => {
    const dto = createDTOWithExtras({
      images: ['aW1hZ2Ux', 'aW1hZ2Uy'],
    });

    const errors = await ValidationObjectFactory.validateObject(dto);

    expect(errors).toHaveLength(0);
  });

  it('should accept images when base64 is buffer', async () => {
    const dto = createDTOWithExtras({
      images: [Buffer.from('aW1hZ2Ux'), Buffer.from('aW1hZ2Uy')] as any[],
    });

    const errors = await ValidationObjectFactory.validateObject(dto);

    expect(errors).toHaveLength(0);
  });
});
