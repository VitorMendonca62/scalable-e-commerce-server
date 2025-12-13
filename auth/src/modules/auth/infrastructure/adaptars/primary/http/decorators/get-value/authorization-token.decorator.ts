import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AuthorizationToken = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.headers['authorization'];
  },
);
