import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      '.open-next/**',
      // Wrangler/Miniflare scratch bundles, written by `npm run preview` and
      // `deploy`. Generated worker output, and linting it fails the build for
      // anyone who previews before linting.
      '.wrangler/**',
      '.vercel/**',
      'storybook-static/**',
      'coverage/**',
      'public/**',
      'dist/**',
      'build/**',
      'out/**'
    ]
  },
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        // WHATWG globals available in every Node version this repo supports
        // (Node 22). Declared so config files can use them without importing
        // from `node:url` purely to satisfy `no-undef`.
        URL: 'readonly',
        URLSearchParams: 'readonly'
      }
    },
    rules: {
      ...js.configs.recommended.rules
    }
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        React: 'readonly',
        JSX: 'readonly',
        console: 'readonly',
        process: 'readonly',
        window: 'readonly',
        navigator: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        Navigator: 'readonly',
        KeyboardEvent: 'readonly',
        Headers: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        RequestInit: 'readonly',
        AbortController: 'readonly',
        DOMException: 'readonly',
        IntersectionObserver: 'readonly',
        IntersectionObserverEntry: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLElement: 'readonly',
        HTMLAnchorElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLUListElement: 'readonly',
        MouseEvent: 'readonly',
        Node: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': ts
    },
    rules: {
      ...js.configs.recommended.rules,
      ...ts.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_'}],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-empty': ['error', {allowEmptyCatch: true}]
    }
  }
];
