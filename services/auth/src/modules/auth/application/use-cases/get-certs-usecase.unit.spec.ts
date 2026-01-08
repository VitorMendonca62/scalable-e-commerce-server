import { EnvironmentVariables } from '@config/environment/env.validation';
import { ConfigService } from '@nestjs/config';

jest.mock('fs', () => {
  return {
    __esModule: true,
    readFileSync: jest.fn(),
  };
});

jest.mock('path', () => {
  return {
    __esModule: true,
    join: jest.fn(),
  };
});

jest.mock('jose', () => {
  return {
    __esModule: true,
    importSPKI: jest.fn(),
    exportJWK: jest.fn(),
  };
});

import * as fs from 'fs';
import * as path from 'path';
import { exportJWK, importSPKI } from 'jose';
import GetCertsUseCase from './get-certs-usecase';

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
      get: jest.fn(),
    } as any;

    useCase = new GetCertsUseCase(configService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(configService).toBeDefined();
  });

  describe('getAuthCert', () => {
    beforeEach(() => {
      jest.spyOn(path, 'join').mockReturnValue(mockPath);
      jest.spyOn(fs, 'readFileSync').mockReturnValue(mockPemContent);
      (importSPKI as jest.Mock).mockResolvedValue(mockPublicKey);
      (exportJWK as jest.Mock).mockResolvedValue(mockJwk);
      jest.spyOn(configService, 'get').mockReturnValue(authKeyID);
    });

    it('should call functions with correct parameters', async () => {
      await useCase.getAuthCert();

      expect(path.join).toHaveBeenCalledWith(
        expect.any(String),
        '../../../../../auth-public.pem',
      );
      expect(fs.readFileSync).toHaveBeenCalledWith(mockPath, 'utf-8');
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

    it('should rethrow error if fs.readFileSync throws error', async () => {
      jest.spyOn(fs, 'readFileSync').mockImplementationOnce(() => {
        throw new Error('Error reading file');
      });

      try {
        await useCase.getAuthCert();
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error reading file');
        expect(error.data).toBeUndefined();
      }
    });

    it('should rethrow error if importSPKI throws error', async () => {
      (importSPKI as jest.Mock).mockRejectedValueOnce(
        new Error('Error importing SPKI'),
      );

      try {
        await useCase.getAuthCert();
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error importing SPKI');
        expect(error.data).toBeUndefined();
      }
    });

    it('should rethrow error if exportJWK throws error', async () => {
      (exportJWK as jest.Mock).mockRejectedValueOnce(
        new Error('Error exporting JWK'),
      );

      try {
        await useCase.getAuthCert();
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error exporting JWK');
        expect(error.data).toBeUndefined();
      }
    });
  });

  describe('getResetPassCert', () => {
    beforeEach(() => {
      jest.spyOn(path, 'join').mockReturnValue(mockPath);
      jest.spyOn(fs, 'readFileSync').mockReturnValue(mockPemContent);
      (importSPKI as jest.Mock).mockResolvedValue(mockPublicKey);
      (exportJWK as jest.Mock).mockResolvedValue(mockJwk);
      jest.spyOn(configService, 'get').mockReturnValue(resetPassKeyID);
    });

    it('should call functions with correct parameters', async () => {
      await useCase.getResetPassCert();

      expect(path.join).toHaveBeenCalledWith(
        expect.any(String),
        '../../../../../reset-pass-public.pem',
      );
      expect(fs.readFileSync).toHaveBeenCalledWith(mockPath, 'utf-8');
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

    it('should rethrow error if fs.readFileSync throws error', async () => {
      jest.spyOn(fs, 'readFileSync').mockImplementationOnce(() => {
        throw new Error('Error reading file');
      });

      try {
        await useCase.getResetPassCert();
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error reading file');
        expect(error.data).toBeUndefined();
      }
    });

    it('should rethrow error if importSPKI throws error', async () => {
      (importSPKI as jest.Mock).mockRejectedValueOnce(
        new Error('Error importing SPKI'),
      );

      try {
        await useCase.getResetPassCert();
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error importing SPKI');
        expect(error.data).toBeUndefined();
      }
    });

    it('should rethrow error if exportJWK throws error', async () => {
      (exportJWK as jest.Mock).mockRejectedValueOnce(
        new Error('Error exporting JWK'),
      );

      try {
        await useCase.getResetPassCert();
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error exporting JWK');
        expect(error.data).toBeUndefined();
      }
    });
  });
});
