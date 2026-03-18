import { IDConstants } from '@product/domain/values-objects/constants';
import { CategoryFactory } from '@product/infrastructure/helpers/factories/category-factory';
import { Repository, And, MoreThanOrEqual, LessThan } from 'typeorm';
import CategoryModel from '../models/categories.model';
import TypeOrmCategoryRepository from './typeorm-category.repository';
import CategoryNameConstants from '@product/domain/values-objects/category/name/name.constants';
import CategorySlugConstants from '@product/domain/values-objects/category/slug/slug.constants';

describe('TypeOrmCategoryRepository', () => {
  let repository: TypeOrmCategoryRepository;
  let categoryRepository: Repository<CategoryModel>;

  beforeEach(() => {
    categoryRepository = {
      save: vi.fn(),
      findOne: vi.fn(),
      find: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
    } as any;

    repository = new TypeOrmCategoryRepository(categoryRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
    expect(categoryRepository).toBeDefined();
  });

  describe('create', () => {
    const mockCategory = {
      publicID: IDConstants.EXEMPLE,
      name: CategoryNameConstants.EXEMPLE,
      slug: CategorySlugConstants.EXEMPLE,
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
        slug: 'full-category',
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
        slug: 'inactive-category',
        active: false,
      };

      await repository.create(inactiveCategory);

      expect(categoryRepository.save).toHaveBeenCalledWith(inactiveCategory);
    });
  });

  describe('findBySlug', () => {
    const slug = CategorySlugConstants.EXEMPLE;
    const mockCategory = CategoryFactory.createModel();

    beforeEach(() => {
      vi.spyOn(categoryRepository, 'findOne').mockResolvedValue(mockCategory);
    });

    it('should call findOne with correct parameters', async () => {
      await repository.findBySlug(slug);

      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { slug },
        select: ['id', 'name', 'slug', 'active', 'createdAt', 'updatedAt'],
      });
    });

    it('should return category when found', async () => {
      const result = await repository.findBySlug(slug);

      expect(result).toEqual(mockCategory);
    });

    it('should return null when category is not found', async () => {
      vi.spyOn(categoryRepository, 'findOne').mockResolvedValue(null);

      const result = await repository.findBySlug('non-existent-slug');

      expect(result).toBeNull();
    });

    it('should select only specific fields', async () => {
      await repository.findBySlug(slug);

      const callArgs = (categoryRepository.findOne as any).mock.calls[0][0];

      expect(callArgs.select).toEqual([
        'id',
        'name',
        'slug',
        'active',
        'createdAt',
        'updatedAt',
      ]);
      expect(callArgs.select).not.toContain('publicID');
      expect(callArgs.select).not.toContain('products');
    });

    it('should verify where clause contains only slug', async () => {
      await repository.findBySlug(slug);

      const callArgs = (categoryRepository.findOne as any).mock.calls[0][0];

      expect(callArgs.where).toHaveProperty('slug', slug);
      expect(Object.keys(callArgs.where)).toHaveLength(1);
    });
  });

  describe('findAll', () => {
    const page = 1;
    const mockCategories = [
      CategoryFactory.createModel(),
      CategoryFactory.createModel({ name: 'Fashion' }),
    ];

    beforeEach(() => {
      vi.spyOn(categoryRepository, 'find').mockResolvedValue(mockCategories);
    });

    it('should call find with correct parameters for page 1', async () => {
      await repository.findAll(1);

      expect(categoryRepository.find).toHaveBeenCalledWith({
        select: [
          'publicID',
          'name',
          'slug',
          'active',
          'createdAt',
          'updatedAt',
        ],
        where: { id: And(MoreThanOrEqual(25), LessThan(50)) },
        order: { id: 'ASC' },
      });
    });

    it('should call find with correct parameters for page 0', async () => {
      await repository.findAll(0);

      expect(categoryRepository.find).toHaveBeenCalledWith({
        select: [
          'publicID',
          'name',
          'slug',
          'active',
          'createdAt',
          'updatedAt',
        ],
        where: { id: And(MoreThanOrEqual(0), LessThan(25)) },
        order: { id: 'ASC' },
      });
    });

    it('should call find with correct parameters for page 2', async () => {
      await repository.findAll(2);

      expect(categoryRepository.find).toHaveBeenCalledWith({
        select: [
          'publicID',
          'name',
          'slug',
          'active',
          'createdAt',
          'updatedAt',
        ],
        where: { id: And(MoreThanOrEqual(50), LessThan(75)) },
        order: { id: 'ASC' },
      });
    });

    it('should return categories when found', async () => {
      const result = await repository.findAll(page);

      expect(result).toEqual(mockCategories);
    });

    it('should return empty array when no categories found', async () => {
      vi.spyOn(categoryRepository, 'find').mockResolvedValue([]);

      const result = await repository.findAll(page);

      expect(result).toEqual([]);
    });

    it('should select only specific fields excluding id and products', async () => {
      await repository.findAll(page);

      const callArgs = (categoryRepository.find as any).mock.calls[0][0];

      expect(callArgs.select).toEqual([
        'publicID',
        'name',
        'slug',
        'active',
        'createdAt',
        'updatedAt',
      ]);
      expect(callArgs.select).not.toContain('id');
      expect(callArgs.select).not.toContain('products');
    });

    it('should order by id in ascending order', async () => {
      await repository.findAll(page);

      const callArgs = (categoryRepository.find as any).mock.calls[0][0];

      expect(callArgs.order).toEqual({ id: 'ASC' });
    });
  });

  describe('update', () => {
    const categoryUpdate = {
      publicID: IDConstants.EXEMPLE,
      name: 'Updated Name',
      slug: 'updated-slug',
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
        { name: 'Updated Name', slug: 'updated-slug' },
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
      expect(callArgs).toHaveProperty('slug');
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

    it('should handle partial updates with only slug', async () => {
      const partialUpdate = {
        publicID: IDConstants.EXEMPLE,
        slug: 'only-slug',
      };

      await repository.update(partialUpdate);

      expect(categoryRepository.update).toHaveBeenCalledWith(
        { publicID: IDConstants.EXEMPLE },
        { slug: 'only-slug' },
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
        slug: 'full-update',
        active: false,
      };

      await repository.update(fullUpdate);

      expect(categoryRepository.update).toHaveBeenCalledWith(
        { publicID: IDConstants.EXEMPLE },
        { name: 'Full Update', slug: 'full-update', active: false },
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

  describe('exists', () => {
    const slug = CategorySlugConstants.EXEMPLE;

    beforeEach(() => {
      vi.spyOn(categoryRepository, 'exists').mockResolvedValue(true);
    });

    it('should call exists with correct parameters', async () => {
      await repository.exists(slug);

      expect(categoryRepository.exists).toHaveBeenCalledWith({
        where: { slug },
      });
    });

    it('should return true when category exists', async () => {
      const result = await repository.exists(slug);

      expect(result).toBe(true);
    });

    it('should return false when category does not exist', async () => {
      vi.spyOn(categoryRepository, 'exists').mockResolvedValue(false);

      const result = await repository.exists('non-existent-slug');

      expect(result).toBe(false);
    });

    it('should verify where clause contains only slug', async () => {
      await repository.exists(slug);

      const callArgs = (categoryRepository.exists as any).mock.calls[0][0];

      expect(callArgs.where).toHaveProperty('slug', slug);
      expect(Object.keys(callArgs.where)).toHaveLength(1);
    });

    it('should check multiple slugs', async () => {
      const slugs = ['electronics', 'fashion', 'home-decor'];

      vi.spyOn(categoryRepository, 'exists')
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);

      const results = await Promise.all(
        slugs.map((slug) => repository.exists(slug)),
      );

      expect(results).toEqual([true, false, true]);
      expect(categoryRepository.exists).toHaveBeenCalledTimes(3);
    });

    it('should handle duplicate slug checks', async () => {
      vi.spyOn(categoryRepository, 'exists')
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);

      const firstCheck = await repository.exists(slug);
      const secondCheck = await repository.exists(slug);

      expect(firstCheck).toBe(false);
      expect(secondCheck).toBe(true);
      expect(categoryRepository.exists).toHaveBeenCalledTimes(2);
    });
  });
});
