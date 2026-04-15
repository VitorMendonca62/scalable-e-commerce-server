import { ValidationObjectFactory } from '@product/infrastructure/helpers/dto-helper';
import UpdateRatingDTO from './update-rating.dto';

describe('UpdateRatingDTO', () => {
  const createDTO = (overrides?: Partial<UpdateRatingDTO>) => {
    const dto = new UpdateRatingDTO();
    if (overrides) {
      Object.assign(dto, overrides);
    }
    return dto;
  };

  it('should success validation when all fields are valid', async () => {
    const errors = await ValidationObjectFactory.validateObject(
      createDTO({
        value: 4,
        comment: 'Produto excelente',
        images: ['aW1hZ2Ux', 'aW1hZ2Uy'],
      }),
    );

    expect(errors).toHaveLength(0);
  });

  it('should success validation when all fields are undefined (partial update)', async () => {
    const errors = await ValidationObjectFactory.validateObject(createDTO());

    expect(errors).toHaveLength(0);
  });

  it('should success validation when only value is provided', async () => {
    const errors = await ValidationObjectFactory.validateObject(
      createDTO({ value: 5 }),
    );

    expect(errors).toHaveLength(0);
  });

  it('should success validation when only comment is provided', async () => {
    const errors = await ValidationObjectFactory.validateObject(
      createDTO({ comment: 'Comentario atualizado' }),
    );

    expect(errors).toHaveLength(0);
  });

  it('should success validation when only images are provided', async () => {
    const errors = await ValidationObjectFactory.validateObject(
      createDTO({ images: ['aW1hZ2Ux'] }),
    );

    expect(errors).toHaveLength(0);
  });
});
