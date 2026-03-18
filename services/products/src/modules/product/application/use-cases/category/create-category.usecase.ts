import { Injectable } from '@nestjs/common';
import CategoryEntity from '@product/domain/entities/category.entity';
import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import {
  CreateCategoryPort,
  ExecuteReturn,
} from '@product/domain/ports/application/category/create-category.port';
import { CategoryRepository } from '@product/domain/ports/secondary/category-repository.port';
import { v7 } from 'uuid';

@Injectable()
export default class CreateCategoryUseCase implements CreateCategoryPort {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(category: CategoryEntity): Promise<ExecuteReturn> {
    try {
      const exists = await this.categoryRepository.exists(category.slug);

      if (exists) {
        return {
          ok: false,
          message: 'Já existe uma categoria com este slug',
          reason: ApplicationResultReasons.ALREADY_EXISTS,
        };
      }

      const newCategory = {
        publicID: v7(),
        name: category.name,
        slug: category.slug,
        active: category.active,
      };

      await this.categoryRepository.create(newCategory);

      return {
        ok: true,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return {
        ok: false,
        message: 'Não foi possível criar a categoria',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      };
    }
  }
}
