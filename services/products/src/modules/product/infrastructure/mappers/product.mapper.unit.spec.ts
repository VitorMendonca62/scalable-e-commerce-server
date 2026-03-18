import ProductEntity from '@product/domain/entities/product.entity';
import { IDConstants } from '@product/domain/values-objects/constants';
import {
  ProductDTOFactory,
  ProductFactory,
} from '../helpers/factories/product-factory';
import ProductMapper from './product.mapper';
import { PaymentTypes } from '@product/domain/enums/payments-types.enum';
import { v7 } from 'uuid';
import { type Mock } from 'vitest';
// Mock do uuid v7
vi.mock('uuid', () => {
  return { v7: vi.fn() };
});

describe('ProductMapper', () => {
  let mapper: ProductMapper;

  beforeEach(() => {
    mapper = new ProductMapper();

    (v7 as Mock).mockReturnValue(`id-${IDConstants.EXEMPLE}`);
  });

  it('should be defined', () => {
    expect(mapper).toBeDefined();
  });

  describe('createDTOForEntity', () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance();
    const userID = IDConstants.EXEMPLE;

    it('should return ProductEntity with correct types', () => {
      const entity = mapper.createDTOForEntity(dto, userID);

      expect(entity).toBeInstanceOf(ProductEntity);
      expect(typeof entity.publicID).toBe('string');
      expect(typeof entity.title).toBe('string');
      expect(typeof entity.price).toBe('number');
      expect(typeof entity.description).toBe('string');
      expect(typeof entity.overview).toBe('string');
      expect(Array.isArray(entity.photos)).toBe(true);
      expect(Array.isArray(entity.payments)).toBe(true);
      expect(typeof entity.active).toBe('boolean');
      expect(typeof entity.stock).toBe('number');
      expect(typeof entity.owner).toBe('string');
    });

    it('should return ProductEntity with correct fields from DTO', () => {
      const entity = mapper.createDTOForEntity(dto, userID);

      expect(entity.title).toBe(dto.title);
      expect(entity.price).toBe(dto.price);
      expect(entity.description).toBe(dto.description);
      expect(entity.overview).toBe(dto.overview);
      expect(entity.photos).toEqual(dto.photos);
      expect(entity.payments).toEqual(dto.payments);
      expect(entity.active).toBe(dto.active);
      expect(entity.stock).toBe(dto.stock);
      expect(entity.owner).toBe(userID);
    });

    it('should generate publicID using uuid v7', () => {
      const entity = mapper.createDTOForEntity(dto, userID);

      expect(entity.publicID).toBe(`id-${IDConstants.EXEMPLE}`);
    });

    it('should map all fields correctly', () => {
      const customDTO = ProductDTOFactory.createProductDTOLikeInstance({
        title: 'Custom Product',
        price: 5000,
        description: 'Custom description for testing',
        overview: 'Custom overview for testing',
        photos: ['https://example.com/photo1.jpg'],
        payments: [PaymentTypes.PIX],
        active: false,
        stock: 100,
      });

      const entity = mapper.createDTOForEntity(customDTO, 'custom-user-id');

      expect(entity.title).toBe('Custom Product');
      expect(entity.price).toBe(5000);
      expect(entity.description).toBe('Custom description for testing');
      expect(entity.overview).toBe('Custom overview for testing');
      expect(entity.photos).toEqual(['https://example.com/photo1.jpg']);
      expect(entity.payments).toEqual([PaymentTypes.PIX]);
      expect(entity.active).toBe(false);
      expect(entity.stock).toBe(100);
      expect(entity.owner).toBe('custom-user-id');
    });

    it('should handle empty arrays correctly', () => {
      const dtoWithEmptyArrays = ProductDTOFactory.createProductDTOLikeInstance(
        {
          photos: [],
          payments: [],
        },
      );

      const entity = mapper.createDTOForEntity(dtoWithEmptyArrays, userID);

      expect(entity.photos).toEqual([]);
      expect(entity.payments).toEqual([]);
    });

    it('should handle multiple photos and payments', () => {
      const dtoWithMultiple = ProductDTOFactory.createProductDTOLikeInstance({
        photos: [
          'https://example.com/photo1.jpg',
          'https://example.com/photo2.jpg',
          'https://example.com/photo3.jpg',
        ],
        payments: [
          PaymentTypes.PIX,
          PaymentTypes.BILLET,
          PaymentTypes.CREDIT_CARD,
        ],
      });

      const entity = mapper.createDTOForEntity(dtoWithMultiple, userID);

      expect(entity.photos).toHaveLength(3);
      expect(entity.payments).toHaveLength(3);
      expect(entity.photos).toEqual([
        'https://example.com/photo1.jpg',
        'https://example.com/photo2.jpg',
        'https://example.com/photo3.jpg',
      ]);
      expect(entity.payments).toEqual([
        PaymentTypes.PIX,
        PaymentTypes.BILLET,
        PaymentTypes.CREDIT_CARD,
      ]);
    });
  });

  describe('entityForModel', () => {
    const productEntity = ProductFactory.createEntity();

    it('should return model object with correct fields', () => {
      const model = mapper.entityForModel(productEntity);

      expect(model.title).toBe(productEntity.title);
      expect(model.publicID).toBe(productEntity.publicID);
      expect(model.price).toBe(productEntity.price);
      expect(model.overview).toBe(productEntity.overview);
      expect(model.description).toBe(productEntity.description);
      expect(model.photos).toEqual(productEntity.photos);
      expect(model.payments).toEqual(productEntity.payments);
      expect(model.active).toBe(productEntity.active);
      expect(model.stock).toBe(productEntity.stock);
      expect(model.owner).toBe(productEntity.owner);
    });

    it('should omit id, createdAt and updatedAt fields', () => {
      const model = mapper.entityForModel(productEntity);

      expect(model).not.toHaveProperty('id');
      expect(model).not.toHaveProperty('createdAt');
      expect(model).not.toHaveProperty('updatedAt');
    });

    it('should map all required fields', () => {
      const model = mapper.entityForModel(productEntity);

      expect(model).toHaveProperty('title');
      expect(model).toHaveProperty('publicID');
      expect(model).toHaveProperty('price');
      expect(model).toHaveProperty('overview');
      expect(model).toHaveProperty('description');
      expect(model).toHaveProperty('photos');
      expect(model).toHaveProperty('payments');
      expect(model).toHaveProperty('active');
      expect(model).toHaveProperty('stock');
      expect(model).toHaveProperty('owner');
    });

    it('should handle custom entity values correctly', () => {
      const customEntity = ProductFactory.createEntity({
        title: 'Mapped Product',
        price: 15000,
        overview: 'Mapped overview',
        description: 'Mapped description',
        photos: ['https://mapped.com/photo.jpg'],
        payments: [PaymentTypes.PIX],
        active: false,
        stock: 0,
        owner: 'mapped-owner-id',
      });

      const model = mapper.entityForModel(customEntity);

      expect(model.title).toBe('Mapped Product');
      expect(model.price).toBe(15000);
      expect(model.overview).toBe('Mapped overview');
      expect(model.description).toBe('Mapped description');
      expect(model.photos).toEqual(['https://mapped.com/photo.jpg']);
      expect(model.payments).toEqual([PaymentTypes.PIX]);
      expect(model.active).toBe(false);
      expect(model.stock).toBe(0);
      expect(model.owner).toBe('mapped-owner-id');
    });

    it('should preserve array references', () => {
      const entity = ProductFactory.createEntity();
      const model = mapper.entityForModel(entity);

      expect(model.photos).toEqual(entity.photos);
      expect(model.payments).toEqual(entity.payments);
    });

    it('should handle inactive products', () => {
      const inactiveEntity = ProductFactory.createEntity({
        active: false,
        stock: 0,
      });

      const model = mapper.entityForModel(inactiveEntity);

      expect(model.active).toBe(false);
      expect(model.stock).toBe(0);
    });

    it('should handle products with zero stock', () => {
      const zeroStockEntity = ProductFactory.createEntity({
        stock: 0,
      });

      const model = mapper.entityForModel(zeroStockEntity);

      expect(model.stock).toBe(0);
    });
  });

  describe('integration: DTO -> Entity -> Model', () => {
    it('should successfully convert DTO to Entity and then to Model', () => {
      const dto = ProductDTOFactory.createProductDTOLikeInstance();
      const userID = IDConstants.EXEMPLE;

      // DTO -> Entity
      const entity = mapper.createDTOForEntity(dto, userID);

      // Entity -> Model
      const model = mapper.entityForModel(entity);

      // Verify data integrity through the pipeline
      expect(model.title).toBe(dto.title);
      expect(model.price).toBe(dto.price);
      expect(model.description).toBe(dto.description);
      expect(model.overview).toBe(dto.overview);
      expect(model.photos).toEqual(dto.photos);
      expect(model.payments).toEqual(dto.payments);
      expect(model.active).toBe(dto.active);
      expect(model.stock).toBe(dto.stock);
      expect(model.owner).toBe(userID);
      expect(model.publicID).toBe(`id-${IDConstants.EXEMPLE}`);
    });

    it('should maintain data consistency across transformations', () => {
      const dto = ProductDTOFactory.createProductDTOLikeInstance({
        title: 'Integration Test Product',
        price: 9999,
        active: true,
        stock: 50,
      });

      const entity = mapper.createDTOForEntity(dto, 'test-user');
      const model = mapper.entityForModel(entity);

      expect(entity.title).toBe(model.title);
      expect(entity.price).toBe(model.price);
      expect(entity.active).toBe(model.active);
      expect(entity.stock).toBe(model.stock);
    });
  });

  describe('updateDTOToEntityPartial', () => {
    it('should convert UpdateProductDTO with all fields to partial entity', () => {
      const dto = ProductDTOFactory.createUpdateProductDTO({
        title: 'Updated Title',
        price: 500000,
        description: 'Updated Description',
        overview: 'Updated Overview',
        photos: ['photo1.jpg', 'photo2.jpg'],
        payments: [PaymentTypes.PIX, PaymentTypes.CREDIT_CARD],
        active: false,
        stock: 50,
        categoryID: 'category-uuid-123',
      });

      const result = mapper.updateDTOToEntityPartial(dto);

      expect(result).toEqual({
        title: 'Updated Title',
        price: 500000,
        description: 'Updated Description',
        overview: 'Updated Overview',
        photos: ['photo1.jpg', 'photo2.jpg'],
        payments: [PaymentTypes.PIX, PaymentTypes.CREDIT_CARD],
        active: false,
        stock: 50,
        categoryID: 'category-uuid-123',
      });
    });

    it('should only include title when only title is provided', () => {
      const dto = ProductDTOFactory.createUpdateProductDTO({
        title: 'Only Title',
      });

      const result = mapper.updateDTOToEntityPartial(dto);

      expect(result).toEqual({
        title: 'Only Title',
      });
      expect(Object.keys(result)).toHaveLength(1);
    });

    it('should only include price when only price is provided', () => {
      const dto = ProductDTOFactory.createUpdateProductDTO({
        price: 999999,
      });

      const result = mapper.updateDTOToEntityPartial(dto);

      expect(result).toEqual({
        price: 999999,
      });
      expect(Object.keys(result)).toHaveLength(1);
    });

    it('should only include description when only description is provided', () => {
      const dto = ProductDTOFactory.createUpdateProductDTO({
        description: 'Only Description',
      });

      const result = mapper.updateDTOToEntityPartial(dto);

      expect(result).toEqual({
        description: 'Only Description',
      });
      expect(Object.keys(result)).toHaveLength(1);
    });

    it('should only include overview when only overview is provided', () => {
      const dto = ProductDTOFactory.createUpdateProductDTO({
        overview: 'Only Overview',
      });

      const result = mapper.updateDTOToEntityPartial(dto);

      expect(result).toEqual({
        overview: 'Only Overview',
      });
      expect(Object.keys(result)).toHaveLength(1);
    });

    it('should only include photos when only photos are provided', () => {
      const dto = ProductDTOFactory.createUpdateProductDTO({
        photos: ['photo1.jpg'],
      });

      const result = mapper.updateDTOToEntityPartial(dto);

      expect(result).toEqual({
        photos: ['photo1.jpg'],
      });
      expect(Object.keys(result)).toHaveLength(1);
    });

    it('should only include payments when only payments are provided', () => {
      const dto = ProductDTOFactory.createUpdateProductDTO({
        payments: [PaymentTypes.BILLET],
      });

      const result = mapper.updateDTOToEntityPartial(dto);

      expect(result).toEqual({
        payments: [PaymentTypes.BILLET],
      });
      expect(Object.keys(result)).toHaveLength(1);
    });

    it('should only include active when only active is provided', () => {
      const dto = ProductDTOFactory.createUpdateProductDTO({
        active: false,
      });

      const result = mapper.updateDTOToEntityPartial(dto);

      expect(result).toEqual({
        active: false,
      });
      expect(Object.keys(result)).toHaveLength(1);
    });

    it('should only include stock when only stock is provided', () => {
      const dto = ProductDTOFactory.createUpdateProductDTO({
        stock: 100,
      });

      const result = mapper.updateDTOToEntityPartial(dto);

      expect(result).toEqual({
        stock: 100,
      });
      expect(Object.keys(result)).toHaveLength(1);
    });

    it('should only include categoryID when only categoryID is provided', () => {
      const dto = ProductDTOFactory.createUpdateProductDTO({
        categoryID: 'new-category-uuid',
      });

      const result = mapper.updateDTOToEntityPartial(dto);

      expect(result).toEqual({
        categoryID: 'new-category-uuid',
      });
      expect(Object.keys(result)).toHaveLength(1);
    });

    it('should return empty object when no fields are provided', () => {
      const dto = ProductDTOFactory.createUpdateProductDTO({});

      const result = mapper.updateDTOToEntityPartial(dto);

      expect(result).toEqual({});
      expect(Object.keys(result)).toHaveLength(0);
    });

    it('should include multiple fields when multiple fields are provided', () => {
      const dto = ProductDTOFactory.createUpdateProductDTO({
        title: 'New Title',
        price: 250000,
        active: true,
      });

      const result = mapper.updateDTOToEntityPartial(dto);

      expect(result).toEqual({
        title: 'New Title',
        price: 250000,
        active: true,
      });
      expect(Object.keys(result)).toHaveLength(3);
    });

    it('should not include publicID in result', () => {
      const dto = ProductDTOFactory.createUpdateProductDTO({
        title: 'Test',
      });

      const result = mapper.updateDTOToEntityPartial(dto);

      expect(result).not.toHaveProperty('publicID');
    });

    it('should not include owner in result', () => {
      const dto = ProductDTOFactory.createUpdateProductDTO({
        title: 'Test',
      });

      const result = mapper.updateDTOToEntityPartial(dto);

      expect(result).not.toHaveProperty('owner');
    });

    it('should handle updating title and description together', () => {
      const dto = ProductDTOFactory.createUpdateProductDTO({
        title: 'Updated Title',
        description: 'Updated Description',
      });

      const result = mapper.updateDTOToEntityPartial(dto);

      expect(result).toEqual({
        title: 'Updated Title',
        description: 'Updated Description',
      });
      expect(Object.keys(result)).toHaveLength(2);
    });

    it('should handle updating price and stock together', () => {
      const dto = ProductDTOFactory.createUpdateProductDTO({
        price: 150000,
        stock: 25,
      });

      const result = mapper.updateDTOToEntityPartial(dto);

      expect(result).toEqual({
        price: 150000,
        stock: 25,
      });
      expect(Object.keys(result)).toHaveLength(2);
    });

    it('should handle updating photos and payments together', () => {
      const dto = ProductDTOFactory.createUpdateProductDTO({
        photos: ['new-photo.jpg'],
        payments: [PaymentTypes.PIX, PaymentTypes.CREDIT_CARD],
      });

      const result = mapper.updateDTOToEntityPartial(dto);

      expect(result).toEqual({
        photos: ['new-photo.jpg'],
        payments: [PaymentTypes.PIX, PaymentTypes.CREDIT_CARD],
      });

      expect(Object.keys(result)).toHaveLength(2);
    });

    it('should handle active false value', () => {
      const dto = ProductDTOFactory.createUpdateProductDTO({
        active: false,
      });

      const result = mapper.updateDTOToEntityPartial(dto);

      expect(result.active).toBe(false);
      expect(result).toHaveProperty('active');
    });

    it('should handle stock zero value', () => {
      const dto = ProductDTOFactory.createUpdateProductDTO({
        stock: 0,
      });

      const result = mapper.updateDTOToEntityPartial(dto);

      expect(result.stock).toBe(0);
      expect(result).toHaveProperty('stock');
    });

    it('should preserve array references', () => {
      const photosArray = ['photo1.jpg', 'photo2.jpg'];
      const paymentsArray = [PaymentTypes.PIX, PaymentTypes.CREDIT_CARD];

      const dto = ProductDTOFactory.createUpdateProductDTO({
        photos: photosArray,
        payments: paymentsArray,
      });

      const result = mapper.updateDTOToEntityPartial(dto);

      expect(result.photos).toBe(photosArray);
      expect(result.payments).toBe(paymentsArray);
    });

    it('should only include defined fields and ignore undefined fields', () => {
      const dto = ProductDTOFactory.createUpdateProductDTO({
        title: 'New Title',
        price: undefined,
        description: 'New Description',
        overview: undefined,
      });

      const result = mapper.updateDTOToEntityPartial(dto);

      expect(result).toEqual({
        title: 'New Title',
        description: 'New Description',
      });
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).not.toHaveProperty('price');
      expect(result).not.toHaveProperty('overview');
      expect(Object.keys(result)).toHaveLength(2);
    });

    it('should handle updating category to a different category', () => {
      const dto = ProductDTOFactory.createUpdateProductDTO({
        categoryID: 'new-category-uuid-456',
      });

      const result = mapper.updateDTOToEntityPartial(dto);

      expect(result.categoryID).toBe('new-category-uuid-456');
    });
  });
});
