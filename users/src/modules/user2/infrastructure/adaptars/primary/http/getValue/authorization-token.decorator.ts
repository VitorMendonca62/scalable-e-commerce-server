import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const extractAuthorizationToken = (
  context: ExecutionContext,
): string | undefined => {
  const request = context.switchToHttp().getRequest();
  return request.headers['authorization'];
};

export const AuthorizationToken = createParamDecorator(
  (data: unknown, context: ExecutionContext) =>
    extractAuthorizationToken(context),
);
