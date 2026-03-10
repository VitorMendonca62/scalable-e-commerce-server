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
});
