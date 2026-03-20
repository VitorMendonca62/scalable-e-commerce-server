import { Injectable } from '@nestjs/common';
import CategoryEntity from '@product/domain/entities/category.entity';
import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import {
  ExecuteReturn,
  UpdateCategoryPort,
} from '@product/domain/ports/application/category/update-category.port';
import { CategoryRepository } from '@product/domain/ports/secondary/category-repository.port';

@Injectable()
export default class UpdateCategoryUseCase implements UpdateCategoryPort {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(category: Partial<CategoryEntity>): Promise<ExecuteReturn> {
    try {
      const updated = await this.categoryRepository.update(category);

      if (!updated) {
        return {
          ok: false,
          message: 'Categoria não encontrada',
          reason: ApplicationResultReasons.NOT_FOUND,
        };
      }

      return {
        ok: true,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return {
        ok: false,
        message: 'Não foi possível atualizar a categoria',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      };
    }
  }
}
