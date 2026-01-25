import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['**/*.spec.ts'],
    environment: 'node',
    pool: 'threads',
    clearMocks: true,
    globals: true,
    setupFiles: [
      './tests/setup.ts',
      './src/modules/user/infrastructure/helpers/users/values-objects-mock.ts',
      './src/modules/user/infrastructure/helpers/address/values-objects-mock.ts',
      './src/modules/user/infrastructure/helpers/values-objects-mock.ts',
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
    isolate: false,
    maxConcurrency: 10,
    alias: {
      '@modules': path.resolve(__dirname, './src/modules'),
      '@user': path.resolve(__dirname, './src/modules/user'),
      '@config': path.resolve(__dirname, './src/config'),
      '@common': path.resolve(__dirname, './src/common'),
      '@': path.resolve(__dirname, './'),
    },
  },
});
