import { EnvironmentVariables } from '@config/environment/env.validation';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';

@Injectable()
export default class GatewayMtlsGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  canActivate(context: ExecutionContext) {
    if (context.getType() !== 'http') return true;

    const enabled = this.configService.get<boolean>('MTLS_ENABLED');

    if (!enabled) return true;

    const request = context.switchToHttp().getRequest();
    const socket = request?.raw?.socket;

    if (!socket || !socket.authorized) {
      throw new UnauthorizedException('Gateway certificate required.');
    }

    const peerCertificate = socket.getPeerCertificate?.();

    if (!peerCertificate || Object.keys(peerCertificate).length === 0) {
      throw new UnauthorizedException('Gateway certificate required.');
    }

    const allowedSubjects = this.parseAllowedSubjects(
      this.configService.get<string>('MTLS_ALLOWED_SUBJECTS'),
    );

    if (allowedSubjects.length === 0) return true;

    const subjectCommonName = peerCertificate.subject?.CN ?? '';

    if (!allowedSubjects.includes(subjectCommonName)) {
      throw new UnauthorizedException('Gateway certificate not allowed.');
    }

    return true;
  }

  private parseAllowedSubjects(value: string | undefined) {
    return (value ?? '')
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
}
