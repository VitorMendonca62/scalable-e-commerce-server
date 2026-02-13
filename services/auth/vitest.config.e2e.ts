import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['**/*.e2e.spec.ts'],
    environment: 'node',
    pool: 'threads',
    clearMocks: true,
    globals: true,
    env: {
      NODE_ENV: 'test',
    },
    setupFiles: [
      './src/modules/auth/infrastructure/helpers/tests/values-objects-mock.ts',
      './tests/setup.ts',
    ],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: [
        'src/main.ts',
        'src/**/*.module.ts',
        'src/**/*.entity.ts',
        'src/**/*.config.ts',
        'src/**/env.validation.ts',
        'src/**/*.port.ts',
        'src/config/environment/utils.ts',
        'src/**/database/models/*.ts',
        'src/**/types/*.ts',
        'src/**/constants/*.ts',
        'src/**/enums/*.ts',
      ],
    },
    // isolate: false,
    // maxConcurrency: 10,
    alias: {
      '@auth': path.resolve(__dirname, './src/modules/auth'),
      '@config': path.resolve(__dirname, './src/config'),
      '@common': path.resolve(__dirname, './src/common'),
      '@': path.resolve(__dirname, './'),
    },
    server: {
      deps: {
        inline: ['jose'],
      },
    },
  },
});
