import { HttpStatus } from '@nestjs/common';
import CreateCategoryUseCase from '@product/application/use-cases/category/create-category.usecase';
import DeleteCategoryUseCase from '@product/application/use-cases/category/delete-category.usecase';
import GetCategoriesUseCase from '@product/application/use-cases/category/get-categories.usecase';
import GetCategoryUseCase from '@product/application/use-cases/category/get-category.usecase';
import UpdateCategoryUseCase from '@product/application/use-cases/category/update-category.usecase';
import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import {
  AlreadyExists,
  NotPossible,
  NotFoundItem,
  FieldInvalid,
} from '@product/domain/ports/primary/http/error.port';
import {
  HttpCreatedResponse,
  HttpOKResponse,
} from '@product/domain/ports/primary/http/sucess.port';
import {
  CategoryDTOFactory,
  CategoryFactory,
} from '@product/infrastructure/helpers/factories/category-factory';
import CategoryMapper from '@product/infrastructure/mappers/category.mapper';
import { FastifyReply } from 'fastify';
import CategoryController from './category.controller';

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

      expect(response.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
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

      expect(response.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
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

      expect(response.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
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

      expect(response.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
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

      expect(response.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
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

      expect(response.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
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

      expect(response.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
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
