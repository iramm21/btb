import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['**/*.test.ts', '**/*.test.tsx', '.next/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off'
    }
  }
);
