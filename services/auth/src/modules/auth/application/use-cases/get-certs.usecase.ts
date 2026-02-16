import { EnvironmentVariables } from '@config/environment/env.validation';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { exportJWK, importSPKI, JWK } from 'jose';

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

  async getAuthCert() {
    return {
      ...(await this.getJwk('auth-public.pem')),
      kid: this.configService.get('AUTH_JWT_KEYID'),
      alg: 'RS256',
      use: 'sig',
    };
  }

  async getResetPassCert() {
    return {
      ...(await this.getJwk('reset-pass-public.pem')),
      kid: this.configService.get('RESET_PASS_KEYID'),
      alg: 'RS256',
      use: 'sig',
    };
  }
}
