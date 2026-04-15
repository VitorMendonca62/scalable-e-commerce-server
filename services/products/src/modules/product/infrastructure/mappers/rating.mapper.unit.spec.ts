import RatingEntity from '@product/domain/entities/rating.entity';
import { IDConstants } from '@product/domain/values-objects/constants';
import CreateRatingDTO from '../adaptars/primary/http/dtos/create-rating.dto';
import UpdateRatingDTO from '../adaptars/primary/http/dtos/update-rating.dto';
import RatingMapper from './rating.mapper';

describe('RatingMapper', () => {
  let mapper: RatingMapper;

  beforeEach(() => {
    mapper = new RatingMapper();
  });

  it('should be defined', () => {
    expect(mapper).toBeDefined();
  });

  describe('createDTOForEntity', () => {
    const productID = 'product-123';
    const userID = IDConstants.EXEMPLE;

    const createDTO = () => {
      const dto = new CreateRatingDTO();
      dto.value = 4;
      dto.comment = 'Produto excelente';
      dto.images = ['aW1hZ2Ux', 'aW1hZ2Uy'];
      return dto;
    };

    it('should return RatingEntity with correct types', () => {
      const entity = mapper.createDTOForEntity(createDTO(), productID, userID);

      expect(entity).toBeInstanceOf(RatingEntity);
      expect(typeof entity.productID).toBe('string');
      expect(typeof entity.userID).toBe('string');
      expect(typeof entity.value).toBe('number');
      expect(typeof entity.comment).toBe('string');
      expect(Array.isArray(entity.images)).toBe(true);
    });

    it('should map fields from DTO and parameters', () => {
      const dto = createDTO();
      const entity = mapper.createDTOForEntity(dto, productID, userID);

      expect(entity.productID).toBe(productID);
      expect(entity.userID).toBe(userID);
      expect(entity.value).toBe(dto.value);
      expect(entity.comment).toBe(dto.comment);
      expect(entity.images).toEqual(dto.images);
    });

    it('should handle optional fields as undefined', () => {
      const dto = new CreateRatingDTO();
      dto.value = 5;

      const entity = mapper.createDTOForEntity(dto, productID, userID);

      expect(entity.comment).toBeUndefined();
      expect(entity.images).toBeUndefined();
    });
  });

  describe('entityForModel', () => {
    const entity = new RatingEntity({
      productID: 'product-456',
      userID: 'user-789',
      value: 3,
      comment: 'Comentario',
      images: ['aW1hZ2Ux'],
    });

    it('should return model object with correct fields', () => {
      const model = mapper.entityForModel(entity);

      expect(model).toEqual({
        productID: entity.productID,
        userID: entity.userID,
        value: entity.value,
        comment: entity.comment,
        images: entity.images,
      });
    });

    it('should omit id, createdAt, updatedAt and product fields', () => {
      const model = mapper.entityForModel(entity);

      expect(model).not.toHaveProperty('id');
      expect(model).not.toHaveProperty('createdAt');
      expect(model).not.toHaveProperty('updatedAt');
      expect(model).not.toHaveProperty('product');
    });
  });

  describe('updateDTOToModelPartial', () => {
    const createDTO = (overrides?: Partial<UpdateRatingDTO>) => {
      const dto = new UpdateRatingDTO();
      if (overrides) {
        Object.assign(dto, overrides);
      }
      return dto;
    };

    it('should return partial with all fields when provided', () => {
      const dto = createDTO({
        value: 5,
        comment: 'Atualizado',
        images: ['aW1hZ2Ux'],
      });

      const result = mapper.updateDTOToModelPartial(dto);

      expect(result).toEqual({
        value: 5,
        comment: 'Atualizado',
        images: ['aW1hZ2Ux'],
      });
    });

    it('should return partial with only value', () => {
      const dto = createDTO({ value: 2 });

      const result = mapper.updateDTOToModelPartial(dto);

      expect(result).toEqual({ value: 2 });
    });

    it('should return partial with only comment', () => {
      const dto = createDTO({ comment: 'Somente comentario' });

      const result = mapper.updateDTOToModelPartial(dto);

      expect(result).toEqual({ comment: 'Somente comentario' });
    });

    it('should return partial with only images', () => {
      const dto = createDTO({ images: ['aW1hZ2Ux'] });

      const result = mapper.updateDTOToModelPartial(dto);

      expect(result).toEqual({ images: ['aW1hZ2Ux'] });
    });

    it('should return empty object when no fields are provided', () => {
      const result = mapper.updateDTOToModelPartial(createDTO());

      expect(result).toEqual({});
    });
  });
});
