import { Cookies } from '@auth/domain/enums/cookies.enum';
import {
  EnvironmentVariables,
  NodeEnv,
} from '@config/environment/env.validation';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

@Injectable()
export default class CookieService {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  setCookie(name: string, value: string, age: number, response: Response) {
    response.cookie(name, value, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === NodeEnv.Production,
      sameSite: 'strict',
      maxAge: age,
      path: '/',
    });
  }

  extractFromRequest(request: Request, cookieName: Cookies): string | null {
    if (request?.cookies === undefined || request?.cookies === null) {
      return null;
    }

    const token = request.cookies[cookieName];
    if (token === undefined || token === null) {
      return null;
    }

    return token;
  }
}
