// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = defineConfig([
  {
    // Código gerado por scripts: conferido por `verificar:angular` e `verificar:kcx-angular`.
    // Para mudar, altere o gerador (scripts/gerar-*.ts), não o arquivo.
    ignores: ['src/app/efeitos-angular/**', 'src/app/kcx-angular/**', 'dist/**', '.angular/**'],
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: ['kx', 'kcx', 'app'], style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: ['kx', 'kcx', 'app'], style: 'kebab-case' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Estilo: `type` e `interface` são aceitos igualmente.
      '@typescript-eslint/consistent-type-definitions': 'off',
    },
  },
  {
    // Fronteira: o núcleo do KCX é TypeScript puro (roda no Figma e em testes sem navegador).
    files: ['src/app/kcx/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/pages/**', '**/layout/**', '**/shared/components/**'],
              message: 'O núcleo do KCX não pode depender de telas.',
            },
            {
              group: ['@angular/*'],
              message: 'O núcleo do KCX não usa Angular; isso fica em pages/kcx.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/app/core/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['**/pages/**'], message: 'core/ não pode depender de pages/.' }] },
      ],
    },
  },
  {
    files: ['**/*.spec.ts', 'src/test-setup.ts'],
    rules: { '@typescript-eslint/no-empty-function': 'off' },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
]);
