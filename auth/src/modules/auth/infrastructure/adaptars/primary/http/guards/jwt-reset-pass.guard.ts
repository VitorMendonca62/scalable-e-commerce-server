import { AuthGuard } from '@nestjs/passport';

export class JWTResetPassGuard extends AuthGuard('jwt-reset-pass') {}
