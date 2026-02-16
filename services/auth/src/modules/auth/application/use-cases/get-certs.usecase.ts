import { EnvironmentVariables } from '@config/environment/env.validation';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { exportJWK, importSPKI } from 'jose';

@Injectable()
export default class GetCertsUseCase {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  private async getJwk(file: `${string}.pem`) {
    const publicPem = await fs.promises.readFile(
      path.join(process.cwd(), `certs/${file}`),
      'utf-8',
    );
    const publicKey = await importSPKI(publicPem, 'RS256');
    return await exportJWK(publicKey);
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
