import { EnvironmentVariables } from '@config/environment/env.validation';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { exportJWK, importSPKI, JWK } from 'jose';
import { ApplicationResultReasons } from '@auth/domain/enums/application-result-reasons';

type GetCertResult =
  | {
      ok: true;
      result: JWK & { kid: string; alg: 'RS256'; use: 'sig' };
    }
  | {
      ok: false;
      reason: ApplicationResultReasons.NOT_POSSIBLE;
      message: string;
    };

@Injectable()
export default class GetCertsUseCase {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  private jwkCache: Record<string, JWK> = {};

  private async getJwk(file: `${string}.pem`) {
    if (this.jwkCache[file] !== undefined) return this.jwkCache[file];

    const publicPem = await fs.promises.readFile(
      path.join(process.cwd(), `certs/${file}`),
      'utf-8',
    );
    const publicKey = await importSPKI(publicPem, 'RS256');
    const jwk = await exportJWK(publicKey);
    this.jwkCache[file] = jwk;
    return jwk;
  }

  async getAuthCert(): Promise<GetCertResult> {
    try {
      return {
        ok: true,
        result: {
          ...(await this.getJwk('auth-public.pem')),
          kid: this.configService.get('AUTH_JWT_KEYID'),
          alg: 'RS256',
          use: 'sig',
        },
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return {
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Erro inesperado. Tente novamente mais tarde.',
      };
    }
  }

  async getResetPassCert(): Promise<GetCertResult> {
    try {
      return {
        ok: true,
        result: {
          ...(await this.getJwk('reset-pass-public.pem')),
          kid: this.configService.get('RESET_PASS_KEYID'),
          alg: 'RS256',
          use: 'sig',
        },
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return {
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Erro inesperado. Tente novamente mais tarde.',
      };
    }
  }
}
