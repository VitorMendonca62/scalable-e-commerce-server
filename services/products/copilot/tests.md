Mapper:
```
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
```

Repository:
```
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
```

Usecase:
``` 
describe('CreateCategoryUseCase', () => {
  let useCase: CreateCategoryUseCase;
  let categoryRepository: CategoryRepository;

  beforeEach(async () => {
    categoryRepository = {
      create: vi.fn(),
      exists: vi.fn(),
    } as any;

    useCase = new CreateCategoryUseCase(categoryRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(categoryRepository).toBeDefined();
  });

  describe('execute', () => {
    const categoryEntity = CategoryFactory.createEntity();

    beforeEach(() => {
      vi.spyOn(categoryRepository, 'exists').mockResolvedValue(false);
      vi.spyOn(categoryRepository, 'create').mockResolvedValue(undefined);
    });

    it('should check if slug already exists', async () => {
      await useCase.execute(categoryEntity);

      expect(categoryRepository.exists).toHaveBeenCalledWith(
        categoryEntity.slug,
      );
    });

    it('should return ALREADY_EXISTS when slug exists', async () => {
      vi.spyOn(categoryRepository, 'exists').mockResolvedValue(true);

      const result = await useCase.execute(categoryEntity);

      expect(result).toEqual({
        ok: false,
        message: 'Já existe uma categoria com este slug',
        reason: ApplicationResultReasons.ALREADY_EXISTS,
      });
      expect(categoryRepository.create).not.toHaveBeenCalled();
    });

    it('should call create with mapped category data', async () => {
      await useCase.execute(categoryEntity);

      expect(categoryRepository.create).toHaveBeenCalledWith({
        publicID: 'uuid-123',
        name: categoryEntity.name,
        slug: categoryEntity.slug,
        active: categoryEntity.active,
      });
    });

    it('should return ok on success', async () => {
      const result = await useCase.execute(categoryEntity);

      expect(result).toEqual({
        ok: true,
      });
    });

    it('should return NOT_POSSIBLE when exists throws error', async () => {
      vi.spyOn(categoryRepository, 'exists').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await useCase.execute(categoryEntity);

      expect(result).toEqual({
        ok: false,
        message: 'Não foi possível criar a categoria',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });

    it('should return NOT_POSSIBLE when create throws error', async () => {
      vi.spyOn(categoryRepository, 'create').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await useCase.execute(categoryEntity);

      expect(result).toEqual({
        ok: false,
        message: 'Não foi possível criar a categoria',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });
  });
});
```

Controller: 
```
describe('CategoryController', () => {
  let controller: CategoryController;
  let createCategoryUseCase: CreateCategoryUseCase;
  let getCategoryUseCase: GetCategoryUseCase;
  let getCategoriesUseCase: GetCategoriesUseCase;
  let updateCategoryUseCase: UpdateCategoryUseCase;
  let deleteCategoryUseCase: DeleteCategoryUseCase;
  let categoryMapper: CategoryMapper;
  let response: FastifyReply;

  beforeEach(async () => {
    createCategoryUseCase = {
      execute: vi.fn(),
    } as any;

    getCategoryUseCase = {
      getBySlug: vi.fn(),
    } as any;

    getCategoriesUseCase = {
      getAll: vi.fn(),
    } as any;

    updateCategoryUseCase = {
      execute: vi.fn(),
    } as any;

    deleteCategoryUseCase = {
      execute: vi.fn(),
    } as any;

    categoryMapper = new CategoryMapper();

    controller = new CategoryController(
      createCategoryUseCase,
      getCategoryUseCase,
      getCategoriesUseCase,
      updateCategoryUseCase,
      deleteCategoryUseCase,
      categoryMapper,
    );

    response = {
      status: vi.fn(),
    } as any;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(createCategoryUseCase).toBeDefined();
    expect(getCategoryUseCase).toBeDefined();
    expect(getCategoriesUseCase).toBeDefined();
    expect(updateCategoryUseCase).toBeDefined();
    expect(deleteCategoryUseCase).toBeDefined();
    expect(categoryMapper).toBeDefined();
  });

  describe('create', () => {
    const dto = CategoryDTOFactory.createCategoryDTOLikeInstance();

    beforeEach(() => {
      vi.spyOn(createCategoryUseCase, 'execute').mockResolvedValue({
        ok: true,
      });
    });

    it('should call createCategoryUseCase.execute with mapped entity', async () => {
      const mapperSpy = vi.spyOn(categoryMapper, 'createDTOToEntity');

      await controller.create(dto, response);

      expect(mapperSpy).toHaveBeenCalledWith(dto);
      expect(createCategoryUseCase.execute).toHaveBeenCalled();
    });

    it('should return HttpCreatedResponse on success', async () => {
      const result = await controller.create(dto, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(result).toBeInstanceOf(HttpCreatedResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'Categoria criada com sucesso',
      });
    });

    it('should return AlreadyExists when category already exists', async () => {
      vi.spyOn(createCategoryUseCase, 'execute').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.ALREADY_EXISTS,
        message: 'Categoria já existe',
      });

      const result = await controller.create(dto, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(result).toBeInstanceOf(AlreadyExists);
      expect(result).toEqual({
        statusCode: HttpStatus.CONFLICT,
        message: 'Categoria já existe',
      });
    });

    it('should return NotPossible on use case failure', async () => {
      vi.spyOn(createCategoryUseCase, 'execute').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Não foi possível criar a categoria',
      });

      const result = await controller.create(dto, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Não foi possível criar a categoria',
      });
    });

    it('should throw error if createCategoryUseCase throws error', async () => {
      vi.spyOn(createCategoryUseCase, 'execute').mockRejectedValue(
        new Error('Erro no use case'),
      );

      try {
        await controller.create(dto, response);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Erro no use case');
      }
    });

    it('should handle database errors via use case', async () => {
      vi.spyOn(createCategoryUseCase, 'execute').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Erro de conexão com banco de dados',
      });

      const result = await controller.create(dto, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(result).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Erro de conexão com banco de dados',
      });
    });
  });

  describe('getAll', () => {
    const page = 1;
    const mockCategories = [
      CategoryFactory.createModel(),
      CategoryFactory.createModel({ name: 'Fashion' }),
    ];

    beforeEach(() => {
      vi.spyOn(getCategoriesUseCase, 'getAll').mockResolvedValue({
        ok: true,
        result: mockCategories,
      });
    });

    it('should call getCategoriesUseCase.getAll with correct page', async () => {
      await controller.getAll(page, response);

      expect(getCategoriesUseCase.getAll).toHaveBeenCalledWith(page);
    });

    it('should return HttpOKResponse with categories on success', async () => {
      const result = await controller.getAll(page, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Categorias encontradas com sucesso',
        data: mockCategories,
      });
    });

    it('should return NotPossible on use case failure', async () => {
      vi.spyOn(getCategoriesUseCase, 'getAll').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Não foi possível buscar as categorias',
      });

      const result = await controller.getAll(page, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Não foi possível buscar as categorias',
      });
    });

    it('should throw error if getCategoriesUseCase throws error', async () => {
      vi.spyOn(getCategoriesUseCase, 'getAll').mockRejectedValue(
        new Error('Erro no use case'),
      );

      try {
        await controller.getAll(page, response);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Erro no use case');
      }
    });

    it('should handle empty categories list', async () => {
      vi.spyOn(getCategoriesUseCase, 'getAll').mockResolvedValue({
        ok: true,
        result: [],
      });

      const result = await controller.getAll(page, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result.data).toEqual([]);
    });

    it('should handle different page numbers', async () => {
      await controller.getAll(2, response);
      expect(getCategoriesUseCase.getAll).toHaveBeenCalledWith(2);

      await controller.getAll(5, response);
      expect(getCategoriesUseCase.getAll).toHaveBeenCalledWith(5);
    });
  });

  describe('getBySlug', () => {
    const slug = 'electronics';
    const mockCategory = CategoryFactory.createModel();

    beforeEach(() => {
      vi.spyOn(getCategoryUseCase, 'getBySlug').mockResolvedValue({
        ok: true,
        result: mockCategory,
      });
    });

    it('should call getCategoryUseCase.getBySlug with correct slug', async () => {
      await controller.getBySlug(slug, response);

      expect(getCategoryUseCase.getBySlug).toHaveBeenCalledWith(slug);
    });

    it('should return HttpOKResponse with category on success', async () => {
      const result = await controller.getBySlug(slug, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Categoria encontrada com sucesso',
        data: mockCategory,
      });
    });

    it('should return NotFoundItem when category is not found', async () => {
      vi.spyOn(getCategoryUseCase, 'getBySlug').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.NOT_FOUND,
        message: 'Categoria não encontrada',
      });

      const result = await controller.getBySlug(slug, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(result).toBeInstanceOf(NotFoundItem);
      expect(result).toEqual({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Categoria não encontrada',
      });
    });

    it('should return NotPossible on other failures', async () => {
      vi.spyOn(getCategoryUseCase, 'getBySlug').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Erro ao buscar categoria',
      });

      const result = await controller.getBySlug(slug, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Erro ao buscar categoria',
      });
    });

    it('should throw error if getCategoryUseCase throws error', async () => {
      vi.spyOn(getCategoryUseCase, 'getBySlug').mockRejectedValue(
        new Error('Erro no use case'),
      );

      try {
        await controller.getBySlug(slug, response);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Erro no use case');
      }
    });
  });

  describe('update', () => {
    const categoryID = 'category-uuid-123';
    const dto = CategoryDTOFactory.createUpdateCategoryDTO({
      name: 'Updated Category',
    });

    beforeEach(() => {
      vi.spyOn(updateCategoryUseCase, 'execute').mockResolvedValue({
        ok: true,
      });
    });

    it('should return FieldInvalid when DTO is empty', async () => {
      const emptyDto = CategoryDTOFactory.createUpdateCategoryDTO({});

      const result = await controller.update(categoryID, emptyDto, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(result).toBeInstanceOf(FieldInvalid);
      expect(result).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Adicione algum campo para a categoria ser atualizada',
        data: 'all',
      });
    });

    it('should call updateCategoryUseCase.execute with mapped partial entity', async () => {
      const mapperSpy = vi.spyOn(categoryMapper, 'updateDTOToEntityPartial');

      await controller.update(categoryID, dto, response);

      expect(mapperSpy).toHaveBeenCalledWith(categoryID, dto);
      expect(updateCategoryUseCase.execute).toHaveBeenCalled();
    });

    it('should return HttpOKResponse on success', async () => {
      const result = await controller.update(categoryID, dto, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Categoria atualizada com sucesso',
      });
    });

    it('should return NotFoundItem when category is not found', async () => {
      vi.spyOn(updateCategoryUseCase, 'execute').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.NOT_FOUND,
        message: 'Categoria não encontrada',
      });

      const result = await controller.update(categoryID, dto, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(result).toBeInstanceOf(NotFoundItem);
      expect(result).toEqual({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Categoria não encontrada',
      });
    });

    it('should return AlreadyExists when updated data conflicts', async () => {
      vi.spyOn(updateCategoryUseCase, 'execute').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.ALREADY_EXISTS,
        message: 'Já existe uma categoria com esse slug',
      });

      const result = await controller.update(categoryID, dto, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(result).toBeInstanceOf(AlreadyExists);
      expect(result).toEqual({
        statusCode: HttpStatus.CONFLICT,
        message: 'Já existe uma categoria com esse slug',
      });
    });

    it('should return NotPossible on other failures', async () => {
      vi.spyOn(updateCategoryUseCase, 'execute').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Erro ao atualizar categoria',
      });

      const result = await controller.update(categoryID, dto, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Erro ao atualizar categoria',
      });
    });

    it('should throw error if updateCategoryUseCase throws error', async () => {
      vi.spyOn(updateCategoryUseCase, 'execute').mockRejectedValue(
        new Error('Erro no use case'),
      );

      try {
        await controller.update(categoryID, dto, response);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Erro no use case');
      }
    });

    it('should handle updating only name', async () => {
      const nameDto = CategoryDTOFactory.createUpdateCategoryDTO({
        name: 'New Name',
      });

      await controller.update(categoryID, nameDto, response);

      expect(updateCategoryUseCase.execute).toHaveBeenCalled();
    });

    it('should handle updating only slug', async () => {
      const slugDto = CategoryDTOFactory.createUpdateCategoryDTO({
        slug: 'new-slug',
      });

      await controller.update(categoryID, slugDto, response);

      expect(updateCategoryUseCase.execute).toHaveBeenCalled();
    });

    it('should handle updating only active status', async () => {
      const activeDto = CategoryDTOFactory.createUpdateCategoryDTO({
        active: false,
      });

      await controller.update(categoryID, activeDto, response);

      expect(updateCategoryUseCase.execute).toHaveBeenCalled();
    });

    it('should handle updating multiple fields', async () => {
      const multiDto = CategoryDTOFactory.createUpdateCategoryDTO({
        name: 'Multi Update',
        slug: 'multi-update',
        active: false,
      });

      await controller.update(categoryID, multiDto, response);

      expect(updateCategoryUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    const categoryID = 'category-uuid-123';

    beforeEach(() => {
      vi.spyOn(deleteCategoryUseCase, 'execute').mockResolvedValue({
        ok: true,
      });
    });

    it('should call deleteCategoryUseCase.execute with correct categoryID', async () => {
      await controller.delete(categoryID, response);

      expect(deleteCategoryUseCase.execute).toHaveBeenCalledWith(categoryID);
    });

    it('should return HttpOKResponse on success', async () => {
      const result = await controller.delete(categoryID, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Categoria deletada com sucesso',
      });
    });

    it('should return NotFoundItem when category is not found', async () => {
      vi.spyOn(deleteCategoryUseCase, 'execute').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.NOT_FOUND,
        message: 'Categoria não encontrada',
      });

      const result = await controller.delete(categoryID, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(result).toBeInstanceOf(NotFoundItem);
      expect(result).toEqual({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Categoria não encontrada',
      });
    });

    it('should return NotPossible on other failures', async () => {
      vi.spyOn(deleteCategoryUseCase, 'execute').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Erro ao deletar categoria',
      });

      const result = await controller.delete(categoryID, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Erro ao deletar categoria',
      });
    });

    it('should throw error if deleteCategoryUseCase throws error', async () => {
      vi.spyOn(deleteCategoryUseCase, 'execute').mockRejectedValue(
        new Error('Erro no use case'),
      );

      try {
        await controller.delete(categoryID, response);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Erro no use case');
      }
    });

    it('should handle database errors via use case', async () => {
      vi.spyOn(deleteCategoryUseCase, 'execute').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Erro de conexão com banco de dados',
      });

      const result = await controller.delete(categoryID, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(result).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Erro de conexão com banco de dados',
      });
    });

    it('should handle multiple delete attempts', async () => {
      const result1 = await controller.delete(categoryID, response);
      expect(result1).toBeInstanceOf(HttpOKResponse);

      vi.spyOn(deleteCategoryUseCase, 'execute').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.NOT_FOUND,
        message: 'Categoria não encontrada',
      });

      const result2 = await controller.delete(categoryID, response);
      expect(result2).toBeInstanceOf(NotFoundItem);
    });
  });
});
```