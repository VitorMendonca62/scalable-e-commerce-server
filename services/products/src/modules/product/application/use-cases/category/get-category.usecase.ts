import { Injectable } from '@nestjs/common';
import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import {
  ExecuteReturn,
  GetCategoryPort,
} from '@product/domain/ports/application/category/get-category.port';
import { CategoryRepository } from '@product/domain/ports/secondary/category-repository.port';

@Injectable()
export default class GetCategoryUseCase implements GetCategoryPort {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async getBySlug(slug: string): Promise<ExecuteReturn> {
    try {
      const category = await this.categoryRepository.findBySlug(slug);

      if (!category) {
        return {
          ok: false,
          message: 'Categoria não encontrada',
          reason: ApplicationResultReasons.NOT_FOUND,
        };
      }

      return {
        ok: true,
        result: {
          publicID: category.publicID,
          name: category.name,
          slug: category.slug,
          active: category.active,
        },
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return {
        ok: false,
        message: 'Não foi possível buscar a categoria',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      };
    }
  }
}
