module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['preact', '@typescript-eslint'],
  extends: ['../.eslintrc.json'],
  ignorePatterns: ['!**/*', 'vite.config.ts'],
  overrides: [
    {
      files: ['*.ts', '*.js', '*.tsx'],
      parserOptions: {
        project: ['sandbox/tsconfig.*?.json'],
      },
      rules: {},
    },
    {
      files: ['*.ts', '*.tsx'],
      rules: {},
    },
    {
      files: ['*.js', '*.jsx'],
      rules: {},
    },
  ],
};
