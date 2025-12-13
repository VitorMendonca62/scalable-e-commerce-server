import { Injectable, PipeTransform } from '@nestjs/common';
import { TokenService } from '@auth/domain/ports/secondary/token-service.port';
import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';

@Injectable()
export class IdInTokenPipe implements PipeTransform<
  string | undefined,
  string
> {
  constructor(private readonly tokenService: TokenService) {}

  transform(authorizationHeader: string | undefined): string {
    const token = authorizationHeader.replace('Bearer ', '');
    const payload = this.tokenService.verifyToken(token);

    const { sub } = payload;

    if (sub == null || sub == undefined) {
      throw new WrongCredentials();
    }

    return sub as string;
  }
}
