import { Injectable } from '@nestjs/common';
import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import {
  ExecuteReturn,
  UpdateRatingPort,
} from '@product/domain/ports/application/rating/update-rating.port';
import RatingRepository from '@product/domain/ports/secondary/rating-repository.port';
import ProductRatingModel from '@product/infrastructure/adaptars/secondary/database/models/rating.model';

@Injectable()
export default class UpdateRatingUseCase implements UpdateRatingPort {
  constructor(private readonly ratingRepository: RatingRepository) {}

  async execute(
    productID: string,
    userID: string,
    updates: Partial<ProductRatingModel>,
  ): Promise<ExecuteReturn> {
    try {
      const updated = await this.ratingRepository.update(productID, userID, {
        ...updates,
      });

      if (!updated) {
        return {
          ok: false,
          reason: ApplicationResultReasons.NOT_FOUND,
          message: 'Avaliação não encontrada',
        };
      }

      return { ok: true };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return {
        ok: false,
        message: 'Não foi possivel atualizar a avaliação',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      };
    }
  }
}
