import { Injectable } from '@nestjs/common';
import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import {
  CreateRatingPort,
  ExecuteReturn,
} from '@product/domain/ports/application/rating/create-rating.port';
import RatingRepository from '@product/domain/ports/secondary/rating-repository.port';
import RatingEntity from '@product/domain/entities/rating.entity';
import RatingMapper from '@product/infrastructure/mappers/rating.mapper';

@Injectable()
export default class CreateRatingUseCase implements CreateRatingPort {
  constructor(
    private readonly ratingRepository: RatingRepository,
    private readonly ratingMapper: RatingMapper,
  ) {}

  async execute(rating: RatingEntity): Promise<ExecuteReturn> {
    try {
      if (await this.ratingRepository.exists(rating.productID, rating.userID)) {
        return {
          ok: false,
          message: 'O usuário já avaliou este produto',
          reason: ApplicationResultReasons.ALREADY_EXISTS,
        };
      }

      await this.ratingRepository.create(
        this.ratingMapper.entityForModel(rating),
      );

      return { ok: true };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return {
        ok: false,
        message: 'Não foi possivel avaliar o produto',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      };
    }
  }
}
