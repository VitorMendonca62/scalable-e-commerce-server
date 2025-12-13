import { ExecutionContext } from '@nestjs/common';

export const createMockContext = (authHeader?: string): ExecutionContext => {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        headers: {
          authorization: authHeader,
        },
      }),
    }),
  } as unknown as ExecutionContext;
};
