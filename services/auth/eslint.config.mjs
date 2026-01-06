import { defineConfig } from 'eslint/config';
import typescriptEsLintPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig([
  {
    languageOptions: {
      globals: {
        node: true,
        jest: true,
      },
    },

    rules: {
      'no-console': 'warn',
      'no-unused-expressions': 'error',
    },
  },

  {
    files: ['**/*.ts'],

    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module',
      },
    },

    plugins: {
      '@typescript-eslint': typescriptEsLintPlugin,
    },

    rules: {
      ...typescriptEsLintPlugin.configs.recommended.rules,

      // Suas substituições de regras
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  prettierRecommended,
]);
