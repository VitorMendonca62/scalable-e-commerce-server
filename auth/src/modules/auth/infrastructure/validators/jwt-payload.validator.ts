import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';
import { JWTTokensTypes } from '@auth/domain/types/jwt-tokens-payload';

export class JwtPayloadValidator {
  static validate<T extends { sub?: string; type?: string }>(
    payload: T | null | undefined,
    errorMessage: string,
    expectedType: JWTTokensTypes,
  ) {
    if (payload === null || payload === undefined) {
      throw new WrongCredentials(errorMessage);
    }

    if (payload.type !== expectedType) {
      throw new WrongCredentials(errorMessage);
    }
  }
}
