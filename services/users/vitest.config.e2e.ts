import { defineConfig } from 'vitest/config';
import path from 'path';
import swc from 'unplugin-swc';

export default defineConfig({
  plugins: [
    swc.vite({
      jsc: {
        parser: {
          syntax: 'typescript',
          decorators: true,
        },
        transform: {
          legacyDecorator: true,
          decoratorMetadata: true,
        },
      },
    }),
  ],
  test: {
    include: ['**/*.e2e.spec.ts'],
    environment: 'node',
    pool: 'forks',
    clearMocks: true,
    globals: true,
    setupFiles: [
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
        'src/**/*.unit.spec.ts',
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
      '@user': path.resolve(__dirname, './src/modules/user'),
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