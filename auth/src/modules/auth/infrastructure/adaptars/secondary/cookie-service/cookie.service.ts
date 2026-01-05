import {
  EnvironmentVariables,
  NodeEnv,
} from '@config/environment/env.validation';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

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
}
