import { Injectable, PipeTransform } from '@nestjs/common';
import { TokenService } from '@user/domain/ports/secondary/token-service.port';
import { WrongCredentials } from '@user/domain/ports/primary/http/error.port';

@Injectable()
export class IdInTokenPipe
  implements PipeTransform<string | undefined, string>
{
  constructor(private readonly tokenService: TokenService) {}

  transform(authorizationHeader: string | undefined): string {
    if (authorizationHeader === undefined || authorizationHeader === null) {
      throw new WrongCredentials();
    }
    if (!authorizationHeader.startsWith('Bearer')) {
      throw new WrongCredentials();
    }

    const token = authorizationHeader.replace('Bearer ', '');
    const payload = this.tokenService.verifyToken(token);

    const { sub } = payload;

    if (sub == null || sub == undefined) {
      throw new WrongCredentials();
    }

    return sub as string;
  }
}
