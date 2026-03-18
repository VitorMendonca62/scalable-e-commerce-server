import { Injectable } from '@nestjs/common';
import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import {
  DeleteCategoryPort,
  ExecuteReturn,
} from '@product/domain/ports/application/category/delete-category.port';
import { CategoryRepository } from '@product/domain/ports/secondary/category-repository.port';

@Injectable()
export default class DeleteCategoryUseCase implements DeleteCategoryPort {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(id: string): Promise<ExecuteReturn> {
    try {
      const deleted = await this.categoryRepository.delete(id);

      if (!deleted) {
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
        message: 'Não foi possível deletar a categoria',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      };
    }
  }
}
