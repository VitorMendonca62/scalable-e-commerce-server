import { EnvironmentVariables } from '@config/environment/env.validation';
import { ConfigService } from '@nestjs/config';
import { type Mock } from 'vitest';
vi.mock('fs', () => {
  return {
    promises: { readFile: vi.fn() },
  };
});

vi.mock('path', () => {
  return {
    join: vi.fn(),
  };
});

vi.mock('jose', () => {
  return {
    importSPKI: vi.fn(),
    exportJWK: vi.fn(),
  };
});

import * as fs from 'fs';
import * as path from 'path';
import { exportJWK, importSPKI } from 'jose';
import GetCertsUseCase from './get-certs.usecase';

describe('GetCertsUseCase', () => {
  let useCase: GetCertsUseCase;
  let configService: ConfigService<EnvironmentVariables>;

  const mockPemContent = 'key';
  const mockPath = '/mock/path/to/file.pem';
  const mockPublicKey = { type: 'public', algorithm: 'RS256' };
  const mockJwk = {
    kty: 'RSA',
    n: 'mock-n',
    e: 'AQAB',
  };
  const authKeyID = 'AUTH_KEY_ID';
  const resetPassKeyID = 'RESET_PASS_KEY_ID';

  beforeEach(async () => {
    configService = {
      get: vi.fn(),
    } as any;

    useCase = new GetCertsUseCase(configService);

    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(configService).toBeDefined();
  });

  describe('getJwk', () => {
    const file = 'auth-public.pem';

    beforeEach(() => {
      vi.spyOn(path, 'join').mockReturnValue(mockPath);
      vi.spyOn(fs.promises, 'readFile').mockResolvedValue(mockPemContent);
      (importSPKI as Mock).mockResolvedValue(mockPublicKey);
      (exportJWK as Mock).mockResolvedValue(mockJwk);
    });

    it('should read, convert, and cache the jwk', async () => {
      const result = await (useCase as any).getJwk(file);

      expect(path.join).toHaveBeenCalledWith(
        expect.any(String),
        `certs/${file}`,
      );
      expect(fs.promises.readFile).toHaveBeenCalledWith(mockPath, 'utf-8');
      expect(importSPKI).toHaveBeenCalledWith(mockPemContent, 'RS256');
      expect(exportJWK).toHaveBeenCalledWith(mockPublicKey);
      expect(result).toEqual(mockJwk);
      expect((useCase as any).jwkCache[file]).toEqual(mockJwk);
    });

    it('should return cached jwk without re-reading the file', async () => {
      (useCase as any).jwkCache = {
        [file]: mockJwk,
      };

      const result = await (useCase as any).getJwk(file);

      expect(result).toEqual(mockJwk);
      expect(path.join).not.toHaveBeenCalled();
      expect(fs.promises.readFile).not.toHaveBeenCalled();
      expect(importSPKI).not.toHaveBeenCalled();
      expect(exportJWK).not.toHaveBeenCalled();
    });
  });

  describe('getAuthCert', () => {
    beforeEach(() => {
      vi.spyOn(path, 'join').mockReturnValue(mockPath);
      vi.spyOn(fs.promises, 'readFile').mockResolvedValue(mockPemContent);
      (importSPKI as Mock).mockResolvedValue(mockPublicKey);
      (exportJWK as Mock).mockResolvedValue(mockJwk);
      vi.spyOn(configService, 'get').mockReturnValue(authKeyID);
    });

    it('should call functions with correct parameters', async () => {
      await useCase.getAuthCert();

      expect(path.join).toHaveBeenCalledWith(
        expect.any(String),
        'certs/auth-public.pem',
      );
      expect(fs.promises.readFile).toHaveBeenCalledWith(mockPath, 'utf-8');
      expect(importSPKI).toHaveBeenCalledWith(mockPemContent, 'RS256');
      expect(exportJWK).toHaveBeenCalledWith(mockPublicKey);
      expect(configService.get).toHaveBeenCalledWith('AUTH_JWT_KEYID');
    });

    it('should return cert with correct structure', async () => {
      const result = await useCase.getAuthCert();

      expect(result).toEqual({
        ...mockJwk,
        kid: authKeyID,
        alg: 'RS256',
        use: 'sig',
      });
    });
  });

  describe('getResetPassCert', () => {
    beforeEach(() => {
      vi.spyOn(path, 'join').mockReturnValue(mockPath);
      vi.spyOn(fs.promises, 'readFile').mockResolvedValue(mockPemContent);
      (importSPKI as Mock).mockResolvedValue(mockPublicKey);
      (exportJWK as Mock).mockResolvedValue(mockJwk);
      vi.spyOn(configService, 'get').mockReturnValue(resetPassKeyID);
    });

    it('should call functions with correct parameters', async () => {
      await useCase.getResetPassCert();

      expect(path.join).toHaveBeenCalledWith(
        expect.any(String),
        'certs/reset-pass-public.pem',
      );
      expect(fs.promises.readFile).toHaveBeenCalledWith(mockPath, 'utf-8');
      expect(importSPKI).toHaveBeenCalledWith(mockPemContent, 'RS256');
      expect(exportJWK).toHaveBeenCalledWith(mockPublicKey);
      expect(configService.get).toHaveBeenCalledWith('RESET_PASS_KEYID');
    });

    it('should return cert with correct structure', async () => {
      const result = await useCase.getResetPassCert();

      expect(result).toEqual({
        ...mockJwk,
        kid: resetPassKeyID,
        alg: 'RS256',
        use: 'sig',
      });
    });
  });
});
