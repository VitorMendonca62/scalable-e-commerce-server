import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import GatewayMtlsGuard from './gateway-mtls.guard';

describe('GatewayMtlsGuard', () => {
  let guard: GatewayMtlsGuard;
  let configService: ConfigService;

  beforeEach(() => {
    configService = {
      get: vi.fn(),
    } as any;

    guard = new GatewayMtlsGuard(configService as any);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
    expect(configService).toBeDefined();
  });

  describe('canActivate', () => {
    let executionContext: ExecutionContext;
    const getTypeMock = vi.fn();
    const getRequestMock = vi.fn();
    const switchToHttpMock = vi.fn();

    beforeEach(() => {
      executionContext = {
        getType: getTypeMock,
        switchToHttp: switchToHttpMock,
      } as any;

      switchToHttpMock.mockReturnValue({ getRequest: getRequestMock });
      (configService.get as any).mockReset();
      getTypeMock.mockReset();
      getRequestMock.mockReset();
    });

    it('should return true when context type is not http', () => {
      getTypeMock.mockReturnValue('rpc');

      const result = guard.canActivate(executionContext);

      expect(result).toBe(true);
      expect(configService.get).not.toHaveBeenCalled();
    });

    it('should return true when mTLS is disabled', () => {
      getTypeMock.mockReturnValue('http');
      (configService.get as any).mockImplementation((key: string) => {
        if (key === 'MTLS_ENABLED') return 'false';
        return undefined;
      });

      const result = guard.canActivate(executionContext);

      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException when socket is missing', () => {
      getTypeMock.mockReturnValue('http');
      (configService.get as any).mockImplementation((key: string) => {
        if (key === 'MTLS_ENABLED') return 'true';
        return undefined;
      });
      getRequestMock.mockReturnValue({ raw: {} });

      expect(() => guard.canActivate(executionContext)).toThrow(
        new UnauthorizedException('Gateway certificate required.'),
      );
    });

    it('should throw UnauthorizedException when socket is unauthorized', () => {
      getTypeMock.mockReturnValue('http');
      (configService.get as any).mockImplementation((key: string) => {
        if (key === 'MTLS_ENABLED') return 'true';
        return undefined;
      });
      getRequestMock.mockReturnValue({
        raw: {
          socket: {
            authorized: false,
          },
        },
      });

      expect(() => guard.canActivate(executionContext)).toThrow(
        new UnauthorizedException('Gateway certificate required.'),
      );
    });

    it('should throw UnauthorizedException when peer certificate is empty', () => {
      getTypeMock.mockReturnValue('http');
      (configService.get as any).mockImplementation((key: string) => {
        if (key === 'MTLS_ENABLED') return 'true';
        return undefined;
      });
      getRequestMock.mockReturnValue({
        raw: {
          socket: {
            authorized: true,
            getPeerCertificate: vi.fn().mockReturnValue({}),
          },
        },
      });

      expect(() => guard.canActivate(executionContext)).toThrow(
        new UnauthorizedException('Gateway certificate required.'),
      );
    });

    it('should return true when mTLS is enabled and allowed subjects is empty', () => {
      getTypeMock.mockReturnValue('http');
      (configService.get as any).mockImplementation((key: string) => {
        if (key === 'MTLS_ENABLED') return 'TRUE';
        if (key === 'MTLS_ALLOWED_SUBJECTS') return '';
        return undefined;
      });
      getRequestMock.mockReturnValue({
        raw: {
          socket: {
            authorized: true,
            getPeerCertificate: vi.fn().mockReturnValue({
              subject: { CN: 'gateway-service' },
            }),
          },
        },
      });

      const result = guard.canActivate(executionContext);

      expect(result).toBe(true);
    });

    it('should return true when certificate CN is allowed', () => {
      getTypeMock.mockReturnValue('http');
      (configService.get as any).mockImplementation((key: string) => {
        if (key === 'MTLS_ENABLED') return 'true';
        if (key === 'MTLS_ALLOWED_SUBJECTS')
          return 'gateway-service,other-service';
        return undefined;
      });
      getRequestMock.mockReturnValue({
        raw: {
          socket: {
            authorized: true,
            getPeerCertificate: vi.fn().mockReturnValue({
              subject: { CN: 'gateway-service' },
            }),
          },
        },
      });

      const result = guard.canActivate(executionContext);

      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException when certificate CN is not allowed', () => {
      getTypeMock.mockReturnValue('http');
      (configService.get as any).mockImplementation((key: string) => {
        if (key === 'MTLS_ENABLED') return 'true';
        if (key === 'MTLS_ALLOWED_SUBJECTS') return 'gateway-service';
        return undefined;
      });
      getRequestMock.mockReturnValue({
        raw: {
          socket: {
            authorized: true,
            getPeerCertificate: vi.fn().mockReturnValue({
              subject: { CN: 'unknown-service' },
            }),
          },
        },
      });

      expect(() => guard.canActivate(executionContext)).toThrow(
        new UnauthorizedException('Gateway certificate not allowed.'),
      );
    });
  });
});
