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
});
