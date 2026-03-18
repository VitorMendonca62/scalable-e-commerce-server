import { Injectable } from '@nestjs/common';
import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import {
  ExecuteReturn,
  FavoriteProductPort,
} from '@product/domain/ports/application/product/favorite-product.port';
import FavoriteRepository from '@product/domain/ports/secondary/favorite-repository.port';

@Injectable()
export default class FavoriteProductUseCase implements FavoriteProductPort {
  constructor(private readonly favoriteRepository: FavoriteRepository) {}

  async favorite(productID: string, userID: string): Promise<ExecuteReturn> {
    try {
      if (await this.favoriteRepository.isFavorite(productID, userID))
        return { ok: true };

      await this.favoriteRepository.favorite(productID, userID);

      return {
        ok: true,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return {
        ok: false,
        message: 'Não foi possivel favoritar o produto',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      };
    }
  }

  async unfavorite(productID: string, userID: string): Promise<ExecuteReturn> {
    try {
      const result = await this.favoriteRepository.unfavorite(
        productID,
        userID,
      );

      if (!result) {
        return {
          ok: false,
          reason: ApplicationResultReasons.NOT_FOUND,
          message: 'Não foi possivel encontrar o produto',
        };
      }

      return {
        ok: true,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return {
        ok: false,
        message: 'Não foi possivel favoritar o produto',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      };
    }
  }
}
