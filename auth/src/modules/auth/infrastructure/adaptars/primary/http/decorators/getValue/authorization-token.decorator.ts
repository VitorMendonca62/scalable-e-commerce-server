import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const extractAuthorizationToken = (
  ctx: ExecutionContext,
): string | undefined => {
  const request = ctx.switchToHttp().getRequest();
  return request.headers['authorization'];
};

export const AuthorizationToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => extractAuthorizationToken(ctx),
);
