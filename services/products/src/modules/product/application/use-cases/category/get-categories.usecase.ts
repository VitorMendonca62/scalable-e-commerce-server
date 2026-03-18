import { Injectable } from '@nestjs/common';
import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import {
  ExecuteReturn,
  GetCategoriesPort,
} from '@product/domain/ports/application/category/get-categories.port';
import { CategoryRepository } from '@product/domain/ports/secondary/category-repository.port';

@Injectable()
export default class GetCategoriesUseCase implements GetCategoriesPort {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async getAll(page: number): Promise<ExecuteReturn> {
    try {
      const categories = await this.categoryRepository.findAll(page);

      return {
        ok: true,
        result: categories,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return {
        ok: false,
        message: 'Não foi possível buscar as categorias',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      };
    }
  }
}
