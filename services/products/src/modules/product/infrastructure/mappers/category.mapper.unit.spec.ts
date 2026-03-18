import CategoryEntity from '@product/domain/entities/category.entity';
import { IDConstants } from '@product/domain/values-objects/constants';
import { v7 } from 'uuid';
import CategoryMapper from './category.mapper';

import { type Mock } from 'vitest';
import {
  CategoryDTOFactory,
  CategoryFactory,
} from '../helpers/factories/category-factory';
vi.mock('uuid', () => {
  return { v7: vi.fn() };
});
describe('CategoryMapper', () => {
  let mapper: CategoryMapper;

  beforeEach(() => {
    mapper = new CategoryMapper();

    (v7 as Mock).mockReturnValue(`id-${IDConstants.EXEMPLE}`);
  });

  it('should be defined', () => {
    expect(mapper).toBeDefined();
  });

  describe('createDTOToEntity', () => {
    const dto = CategoryDTOFactory.createCategoryDTOLikeInstance();

    it('should return CategoryEntity with correct types', () => {
      const entity = mapper.createDTOToEntity(dto);

      expect(entity).toBeInstanceOf(CategoryEntity);
      expect(typeof entity.publicID).toBe('string');
      expect(typeof entity.name).toBe('string');
      expect(typeof entity.slug).toBe('string');
      expect(typeof entity.active).toBe('boolean');
    });

    it('should return CategoryEntity with correct fields from DTO', () => {
      const entity = mapper.createDTOToEntity(dto);

      expect(entity.name).toBe(dto.name);
      expect(entity.slug).toBe(dto.slug);
      expect(entity.active).toBe(dto.active);
    });

    it('should generate publicID using uuid v7', () => {
      const entity = mapper.createDTOToEntity(dto);

      expect(entity.publicID).toBe(`id-${IDConstants.EXEMPLE}`);
    });

    it('should map all fields correctly', () => {
      const customDTO = CategoryDTOFactory.createCategoryDTOLikeInstance({
        name: 'Custom Category',
        slug: 'custom-category',
        active: false,
      });

      const entity = mapper.createDTOToEntity(customDTO);

      expect(entity.name).toBe('Custom Category');
      expect(entity.slug).toBe('custom-category');
      expect(entity.active).toBe(false);
    });

    it('should handle active true value', () => {
      const activeDTO = CategoryDTOFactory.createCategoryDTOLikeInstance({
        active: true,
      });

      const entity = mapper.createDTOToEntity(activeDTO);

      expect(entity.active).toBe(true);
    });

    it('should handle active false value', () => {
      const inactiveDTO = CategoryDTOFactory.createCategoryDTOLikeInstance({
        active: false,
      });

      const entity = mapper.createDTOToEntity(inactiveDTO);

      expect(entity.active).toBe(false);
    });
  });

  describe('entityToModel', () => {
    const categoryEntity = CategoryFactory.createEntity();

    it('should return model object with correct fields', () => {
      const model = mapper.entityToModel(categoryEntity);

      expect(model.publicID).toBe(categoryEntity.publicID);
      expect(model.name).toBe(categoryEntity.name);
      expect(model.slug).toBe(categoryEntity.slug);
      expect(model.active).toBe(categoryEntity.active);
      expect(model).toEqual({
        publicID: categoryEntity.publicID,
        name: categoryEntity.name,
        slug: categoryEntity.slug,
        active: categoryEntity.active,
      });
    });

    it('should omit id, createdAt, updatedAt and products fields', () => {
      const model = mapper.entityToModel(categoryEntity);

      expect(model).not.toHaveProperty('id');
      expect(model).not.toHaveProperty('createdAt');
      expect(model).not.toHaveProperty('updatedAt');
      expect(model).not.toHaveProperty('products');
    });

    it('should map all required fields', () => {
      const model = mapper.entityToModel(categoryEntity);

      expect(model).toHaveProperty('publicID');
      expect(model).toHaveProperty('name');
      expect(model).toHaveProperty('slug');
      expect(model).toHaveProperty('active');
    });

    it('should handle inactive categories', () => {
      const inactiveEntity = CategoryFactory.createEntity({
        active: false,
      });

      const model = mapper.entityToModel(inactiveEntity);

      expect(model.active).toBe(false);
    });

    it('should handle active categories', () => {
      const activeEntity = CategoryFactory.createEntity({
        active: true,
      });

      const model = mapper.entityToModel(activeEntity);

      expect(model.active).toBe(true);
    });
  });

  describe('updateDTOToEntityPartial', () => {
    const categoryID = 'category-uuid-123';

    it('should convert UpdateCategoryDTO with all fields to partial entity', () => {
      const dto = CategoryDTOFactory.createUpdateCategoryDTO({
        name: 'Updated Name',
        slug: 'updated-slug',
        active: false,
      });

      const result = mapper.updateDTOToEntityPartial(categoryID, dto);

      expect(result).toEqual({
        publicID: categoryID,
        name: 'Updated Name',
        slug: 'updated-slug',
        active: false,
      });
    });

    it('should always include publicID in result', () => {
      const dto = CategoryDTOFactory.createUpdateCategoryDTO({});

      const result = mapper.updateDTOToEntityPartial(categoryID, dto);

      expect(result.publicID).toBe(categoryID);
      expect(result).toHaveProperty('publicID');
    });

    it('should only include name when only name is provided', () => {
      const dto = CategoryDTOFactory.createUpdateCategoryDTO({
        name: 'Only Name',
      });

      const result = mapper.updateDTOToEntityPartial(categoryID, dto);

      expect(result).toEqual({
        publicID: categoryID,
        name: 'Only Name',
      });
      expect(Object.keys(result)).toHaveLength(2);
    });

    it('should only include slug when only slug is provided', () => {
      const dto = CategoryDTOFactory.createUpdateCategoryDTO({
        slug: 'only-slug',
      });

      const result = mapper.updateDTOToEntityPartial(categoryID, dto);

      expect(result).toEqual({
        publicID: categoryID,
        slug: 'only-slug',
      });
      expect(Object.keys(result)).toHaveLength(2);
    });

    it('should only include active when only active is provided', () => {
      const dto = CategoryDTOFactory.createUpdateCategoryDTO({
        active: false,
      });

      const result = mapper.updateDTOToEntityPartial(categoryID, dto);

      expect(result).toEqual({
        publicID: categoryID,
        active: false,
      });
      expect(Object.keys(result)).toHaveLength(2);
    });

    it('should return object with only publicID when no fields are provided', () => {
      const dto = CategoryDTOFactory.createUpdateCategoryDTO({});

      const result = mapper.updateDTOToEntityPartial(categoryID, dto);

      expect(result).toEqual({
        publicID: categoryID,
      });
      expect(Object.keys(result)).toHaveLength(1);
    });

    it('should include multiple fields when multiple fields are provided', () => {
      const dto = CategoryDTOFactory.createUpdateCategoryDTO({
        name: 'New Name',
        slug: 'new-slug',
        active: true,
      });

      const result = mapper.updateDTOToEntityPartial(categoryID, dto);

      expect(result).toEqual({
        publicID: categoryID,
        name: 'New Name',
        slug: 'new-slug',
        active: true,
      });
      expect(Object.keys(result)).toHaveLength(4);
    });

    it('should handle active false value', () => {
      const dto = CategoryDTOFactory.createUpdateCategoryDTO({
        active: false,
      });

      const result = mapper.updateDTOToEntityPartial(categoryID, dto);

      expect(result.active).toBe(false);
      expect(result).toHaveProperty('active');
    });

    it('should handle active true value', () => {
      const dto = CategoryDTOFactory.createUpdateCategoryDTO({
        active: true,
      });

      const result = mapper.updateDTOToEntityPartial(categoryID, dto);

      expect(result.active).toBe(true);
      expect(result).toHaveProperty('active');
    });
  });
});
