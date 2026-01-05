import { Cookies } from '@auth/domain/enums/cookies.enum';
import { Request } from 'express';

export class JwtTokenExtractor {
  static extractFromCookie(req: Request, cookieName: Cookies): string | null {
    if (!req?.cookies) {
      return null;
    }

    const token = req.cookies[cookieName];
    if (!token) {
      return null;
    }

    return token.replace(/^Bearer\s+/i, '');
  }
}
