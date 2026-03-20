import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Get,
  Query,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import {
  NotPossible,
  NotFoundItem,
  AlreadyExists,
  FieldInvalid,
} from '@product/domain/ports/primary/http/error.port';
import {
  HttpCreatedResponse,
  HttpOKResponse,
} from '@product/domain/ports/primary/http/sucess.port';
import { FastifyReply } from 'fastify';
import CreateCategoryDTO from '../dtos/create-category.dto';
import UpdateCategoryDTO from '../dtos/update-category.dto';
import CreateCategoryUseCase from '@product/application/use-cases/category/create-category.usecase';
import DeleteCategoryUseCase from '@product/application/use-cases/category/delete-category.usecase';
import GetCategoriesUseCase from '@product/application/use-cases/category/get-categories.usecase';
import UpdateCategoryUseCase from '@product/application/use-cases/category/update-category.usecase';
import CategoryMapper from '@product/infrastructure/mappers/category.mapper';

@Controller('category')
export default class CategoryController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly getCategoriesUseCase: GetCategoriesUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
    private readonly categoryMapper: CategoryMapper,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateCategoryDTO,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    const useCaseResult = await this.createCategoryUseCase.execute(
      this.categoryMapper.createDTOToEntity(dto),
    );

    if (useCaseResult.ok === false) {
      if (useCaseResult.reason === ApplicationResultReasons.ALREADY_EXISTS) {
        response.status(HttpStatus.CONFLICT);
        return new AlreadyExists(useCaseResult.message);
      }

      response.status(HttpStatus.INTERNAL_SERVER_ERROR);
      return new NotPossible(useCaseResult.message);
    }

    response.status(HttpStatus.CREATED);
    return new HttpCreatedResponse('Categoria criada com sucesso');
  }

  @Get()
  async getAll(
    @Res({ passthrough: true }) response: FastifyReply,
    @Query('cursor') cursor?: string,
  ) {
    const useCaseResult = await this.getCategoriesUseCase.getAll(cursor);

    if (useCaseResult.ok === false) {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR);
      return new NotPossible(useCaseResult.message);
    }

    const [categories, lastSeenID] = useCaseResult.result;

    response.status(HttpStatus.OK);
    return new HttpOKResponse('Categorias encontradas com sucesso', {
      categories,
      nextCursor: lastSeenID,
    });
  }

  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDTO,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    if (Object.keys(dto).length === 0) {
      response.status(HttpStatus.BAD_REQUEST);
      return new FieldInvalid(
        'Adicione algum campo para a categoria ser atualizada',
        'all',
      );
    }

    const useCaseResult = await this.updateCategoryUseCase.execute(
      this.categoryMapper.updateDTOToEntityPartial(id, dto),
    );

    if (useCaseResult.ok === false) {
      if (useCaseResult.reason === ApplicationResultReasons.NOT_FOUND) {
        response.status(HttpStatus.NOT_FOUND);
        return new NotFoundItem(useCaseResult.message);
      }

      response.status(HttpStatus.INTERNAL_SERVER_ERROR);
      return new NotPossible(useCaseResult.message);
    }

    response.status(HttpStatus.OK);
    return new HttpOKResponse('Categoria atualizada com sucesso');
  }

  @Delete('/:id')
  async delete(
    @Param('id') id: string,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    const useCaseResult = await this.deleteCategoryUseCase.execute(id);

    if (useCaseResult.ok === false) {
      if (useCaseResult.reason === ApplicationResultReasons.NOT_FOUND) {
        response.status(HttpStatus.NOT_FOUND);
        return new NotFoundItem(useCaseResult.message);
      }

      response.status(HttpStatus.INTERNAL_SERVER_ERROR);
      return new NotPossible(useCaseResult.message);
    }

    response.status(HttpStatus.OK);
    return new HttpOKResponse('Categoria deletada com sucesso');
  }
}
