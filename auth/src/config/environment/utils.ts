import { NodeEnv } from './env.validation';

export function getCurrentNodeENV() {
  switch (process.env.NODE_ENV) {
    case NodeEnv.Production:
      return '.env';
    case NodeEnv.Development:
      return '.env.development';
    case NodeEnv.Test:
      return '.env.test';
  }
}
