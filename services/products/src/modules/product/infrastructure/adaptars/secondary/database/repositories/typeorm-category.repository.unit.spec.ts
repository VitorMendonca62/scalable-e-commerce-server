import { IDConstants } from '@product/domain/values-objects/constants';
import { CategoryFactory } from '@product/infrastructure/helpers/factories/category-factory';
import { Repository, MoreThan } from 'typeorm';
import CategoryModel from '../models/categories.model';
import TypeOrmCategoryRepository from './typeorm-category.repository';
import CategoryNameConstants from '@product/domain/values-objects/category/name/name.constants';
import { CacheCategoryRepository } from '@product/domain/ports/secondary/cache-category-repository.port';

describe('TypeOrmCategoryRepository', () => {
  let repository: TypeOrmCategoryRepository;
  let categoryRepository: Repository<CategoryModel>;
  let cacheCategoryRepository: CacheCategoryRepository;

  beforeEach(() => {
    categoryRepository = {
      save: vi.fn(),
      findOne: vi.fn(),
      find: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
    } as any;

    cacheCategoryRepository = {
      getCategories: vi.fn(),
      add: vi.fn(),
      removeByPublicID: vi.fn(),
    };

    repository = new TypeOrmCategoryRepository(
      categoryRepository,
      cacheCategoryRepository,
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
    expect(categoryRepository).toBeDefined();
    expect(cacheCategoryRepository).toBeDefined();
  });

  describe('create', () => {
    const mockCategory = {
      publicID: IDConstants.EXEMPLE,
      name: CategoryNameConstants.EXEMPLE,
      active: true,
    };

    beforeEach(() => {
      vi.spyOn(categoryRepository, 'save').mockResolvedValue(
        mockCategory as CategoryModel,
      );
    });

    it('should call save with correct parameters', async () => {
      await repository.create(mockCategory);

      expect(categoryRepository.save).toHaveBeenCalledWith(mockCategory);
    });

    it('should save category successfully', async () => {
      await repository.create(mockCategory);

      expect(categoryRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should return void', async () => {
      const result = await repository.create(mockCategory);

      expect(result).toBeUndefined();
    });

    it('should handle category with all fields', async () => {
      const fullCategory = {
        publicID: 'full-id',
        name: 'Full Category',
        active: false,
      };

      await repository.create(fullCategory);

      expect(categoryRepository.save).toHaveBeenCalledWith(fullCategory);
    });

    it('should not include id, createdAt, updatedAt, or products', async () => {
      await repository.create(mockCategory);

      const savedCategory = (categoryRepository.save as any).mock.calls[0][0];

      expect(savedCategory).not.toHaveProperty('id');
      expect(savedCategory).not.toHaveProperty('createdAt');
      expect(savedCategory).not.toHaveProperty('updatedAt');
      expect(savedCategory).not.toHaveProperty('products');
    });

    it('should handle inactive category', async () => {
      const inactiveCategory = {
        publicID: 'inactive-id',
        name: 'Inactive Category',
        active: false,
      };

      await repository.create(inactiveCategory);

      expect(categoryRepository.save).toHaveBeenCalledWith(inactiveCategory);
    });
  });

  describe('findAll', () => {
    const cursor = '123';
    const mockCategories = [
      CategoryFactory.createPublicWithID(),
      CategoryFactory.createPublicWithID({ name: 'Fashion', id: 12 }),
    ];

    beforeEach(() => {
      vi.spyOn(categoryRepository, 'find').mockResolvedValue(
        mockCategories as any,
      );
    });

    describe('without cache', () => {
      beforeEach(() => {
        vi.spyOn(cacheCategoryRepository, 'getCategories').mockResolvedValue(
          null,
        );
      });

      it('should call find with correct parameters for cursor', async () => {
        await repository.findAll(cursor);

        expect(categoryRepository.find).toHaveBeenCalledWith({
          select: ['publicID', 'name', 'id'],
          where: { id: MoreThan(parseInt(cursor)), active: true },
          order: { id: 'ASC' },
          take: 25,
        });

        expect(cacheCategoryRepository.add).toHaveBeenCalledWith(
          cursor,
          mockCategories,
        );
      });

      it('should call find with cursor is 0 when cursor is null', async () => {
        await repository.findAll(null);

        expect(categoryRepository.find).toHaveBeenCalledWith({
          select: ['publicID', 'name', 'id'],
          where: { id: MoreThan(0), active: true },
          order: { id: 'ASC' },
          take: 25,
        });
        expect(cacheCategoryRepository.add).toHaveBeenCalledWith(
          '0',
          mockCategories,
        );
      });

      it('should return categories without id when found and categories length is not 25', async () => {
        const categoriesWithoutID = [
          CategoryFactory.createPublic(),
          CategoryFactory.createPublic({ name: 'Fashion' }),
        ];
        const result = await repository.findAll(cursor);

        expect(result).toEqual([categoriesWithoutID, null]);
      });

      it('should return categories without id when found and categories length is 25', async () => {
        const mockCategories = Array(25)
          .fill(0)
          .map((_, index) => {
            return CategoryFactory.createPublicWithID({
              id: index,
              name: `fashion-${index}`,
            });
          });

        const categoriesWithoutID = Array(25)
          .fill(0)
          .map((_, index) => {
            return CategoryFactory.createPublic({
              name: `fashion-${index}`,
            });
          });

        vi.spyOn(categoryRepository, 'find').mockResolvedValue(
          mockCategories as any,
        );

        const result = await repository.findAll(cursor);

        expect(result).toEqual([categoriesWithoutID, '24']);
      });

      it('should select only specific fields including publicId, name, id', async () => {
        await repository.findAll(cursor);

        const callArgs = (categoryRepository.find as any).mock.calls[0][0];

        expect(callArgs.select).toEqual(['publicID', 'name', 'id']);
        expect(callArgs.select).toContain('id');
        expect(callArgs.select).toContain('publicID');
        expect(callArgs.select).toContain('name');
        expect(callArgs.select).not.toContain('createdAt');
        expect(callArgs.select).not.toContain('updatedAt');
        expect(callArgs.select).not.toContain('products');
      });
    });

    describe('with cache', () => {
      beforeEach(() => {
        vi.spyOn(cacheCategoryRepository, 'getCategories').mockResolvedValue([
          CategoryFactory.createPublicWithID(),
        ]);
      });

      it('should call find with correct parameters for cursor', async () => {
        await repository.findAll(cursor);

        expect(cacheCategoryRepository.getCategories).toHaveBeenCalledWith(
          cursor,
        );
      });

      it('should call find with cursor is 0 when cursor is null', async () => {
        await repository.findAll(null);

        expect(cacheCategoryRepository.getCategories).toHaveBeenCalledWith('0');
      });

      it('should return categories when found and categories length is not 25', async () => {
        const result = await repository.findAll(cursor);

        expect(result).toEqual([[CategoryFactory.createPublic()], null]);
      });

      it('should return categories when found and categories length is 25', async () => {
        const mockCategories = Array(25)
          .fill(0)
          .map((_, index) => {
            return CategoryFactory.createPublicWithID({
              id: index,
              name: `fashion-${index}`,
            });
          });

        vi.spyOn(cacheCategoryRepository, 'getCategories').mockResolvedValue(
          mockCategories,
        );

        const categoriesWithoutID = Array(25)
          .fill(0)
          .map((_, index) => {
            return CategoryFactory.createPublic({
              name: `fashion-${index}`,
            });
          });
        vi.spyOn(categoryRepository, 'find').mockResolvedValue(
          mockCategories as any,
        );

        const result = await repository.findAll(cursor);

        expect(result).toEqual([categoriesWithoutID, '24']);
      });
    });
  });

  describe('update', () => {
    const categoryUpdate = {
      publicID: IDConstants.EXEMPLE,
      name: 'Updated Name',
    };

    beforeEach(() => {
      vi.spyOn(categoryRepository, 'update').mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      });
    });

    it('should call update with correct parameters', async () => {
      await repository.update(categoryUpdate);

      expect(categoryRepository.update).toHaveBeenCalledWith(
        { publicID: IDConstants.EXEMPLE },
        { name: 'Updated Name' },
      );
    });

    it('should return true when category is updated (affected = 1)', async () => {
      const result = await repository.update(categoryUpdate);

      expect(result).toBe(true);
    });

    it('should return true when affected is greater than 1', async () => {
      vi.spyOn(categoryRepository, 'update').mockResolvedValue({
        affected: 3,
        raw: {},
        generatedMaps: [],
      });

      const result = await repository.update(categoryUpdate);

      expect(result).toBe(true);
    });

    it('should return false when category is not found (affected = 0)', async () => {
      vi.spyOn(categoryRepository, 'update').mockResolvedValue({
        affected: 0,
        raw: {},
        generatedMaps: [],
      });

      const result = await repository.update(categoryUpdate);

      expect(result).toBe(false);
    });

    it('should return false when affected is undefined', async () => {
      vi.spyOn(categoryRepository, 'update').mockResolvedValue({
        affected: undefined,
        raw: {},
        generatedMaps: [],
      });

      const result = await repository.update(categoryUpdate);

      expect(result).toBe(false);
    });

    it('should exclude publicID from updates', async () => {
      await repository.update(categoryUpdate);

      const callArgs = (categoryRepository.update as any).mock.calls[0][1];

      expect(callArgs).not.toHaveProperty('publicID');
      expect(callArgs).toHaveProperty('name');
    });

    it('should handle partial updates with only name', async () => {
      const partialUpdate = {
        publicID: IDConstants.EXEMPLE,
        name: 'Only Name',
      };

      await repository.update(partialUpdate);

      expect(categoryRepository.update).toHaveBeenCalledWith(
        { publicID: IDConstants.EXEMPLE },
        { name: 'Only Name' },
      );
    });

    it('should handle partial updates with only active', async () => {
      const partialUpdate = {
        publicID: IDConstants.EXEMPLE,
        active: false,
      };

      await repository.update(partialUpdate);

      expect(categoryRepository.update).toHaveBeenCalledWith(
        { publicID: IDConstants.EXEMPLE },
        { active: false },
      );
    });

    it('should handle updates with all fields', async () => {
      const fullUpdate = {
        publicID: IDConstants.EXEMPLE,
        name: 'Full Update',
        active: false,
      };

      await repository.update(fullUpdate);

      expect(categoryRepository.update).toHaveBeenCalledWith(
        { publicID: IDConstants.EXEMPLE },
        { name: 'Full Update', active: false },
      );
    });

    it('should correctly evaluate affected >= 1 logic', async () => {
      // affected = 1 should return true
      vi.spyOn(categoryRepository, 'update').mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      });
      expect(await repository.update(categoryUpdate)).toBe(true);

      // affected = 2 should return true
      vi.spyOn(categoryRepository, 'update').mockResolvedValue({
        affected: 2,
        raw: {},
        generatedMaps: [],
      });
      expect(await repository.update(categoryUpdate)).toBe(true);

      // affected = 0 should return false
      vi.spyOn(categoryRepository, 'update').mockResolvedValue({
        affected: 0,
        raw: {},
        generatedMaps: [],
      });
      expect(await repository.update(categoryUpdate)).toBe(false);
    });

    it('should use publicID as where clause', async () => {
      await repository.update(categoryUpdate);

      const whereClause = (categoryRepository.update as any).mock.calls[0][0];

      expect(whereClause).toEqual({ publicID: IDConstants.EXEMPLE });
      expect(Object.keys(whereClause)).toHaveLength(1);
    });
  });

  describe('delete', () => {
    const publicID = IDConstants.EXEMPLE;

    beforeEach(() => {
      vi.spyOn(categoryRepository, 'delete').mockResolvedValue({
        affected: 1,
        raw: {},
      });
    });

    it('should call delete with correct parameters', async () => {
      await repository.delete(publicID);

      expect(categoryRepository.delete).toHaveBeenCalledWith({ publicID });
    });

    it('should return true when category is deleted (affected = 1)', async () => {
      const result = await repository.delete(publicID);

      expect(result).toBe(true);
    });

    it('should return true when affected is greater than 1', async () => {
      vi.spyOn(categoryRepository, 'delete').mockResolvedValue({
        affected: 3,
        raw: {},
      });

      const result = await repository.delete(publicID);

      expect(result).toBe(true);
    });

    it('should return false when category does not exist (affected = 0)', async () => {
      vi.spyOn(categoryRepository, 'delete').mockResolvedValue({
        affected: 0,
        raw: {},
      });

      const result = await repository.delete(publicID);

      expect(result).toBe(false);
    });

    it('should return false when affected is undefined', async () => {
      vi.spyOn(categoryRepository, 'delete').mockResolvedValue({
        affected: undefined,
        raw: {},
      });

      const result = await repository.delete(publicID);

      expect(result).toBe(false);
    });

    it('should verify delete uses publicID as key', async () => {
      await repository.delete(publicID);

      const callArgs = (categoryRepository.delete as any).mock.calls[0][0];

      expect(callArgs).toHaveProperty('publicID', publicID);
      expect(Object.keys(callArgs)).toHaveLength(1);
    });

    it('should correctly evaluate affected >= 1 logic', async () => {
      // affected = 1 should return true
      vi.spyOn(categoryRepository, 'delete').mockResolvedValue({
        affected: 1,
        raw: {},
      });
      expect(await repository.delete(publicID)).toBe(true);

      // affected = 2 should return true
      vi.spyOn(categoryRepository, 'delete').mockResolvedValue({
        affected: 2,
        raw: {},
      });
      expect(await repository.delete(publicID)).toBe(true);

      // affected = 0 should return false
      vi.spyOn(categoryRepository, 'delete').mockResolvedValue({
        affected: 0,
        raw: {},
      });
      expect(await repository.delete(publicID)).toBe(false);
    });

    it('should handle delete when category never existed', async () => {
      vi.spyOn(categoryRepository, 'delete').mockResolvedValue({
        affected: 0,
        raw: {},
      });

      const result = await repository.delete('non-existent-id');

      expect(result).toBe(false);
    });
  });
});
