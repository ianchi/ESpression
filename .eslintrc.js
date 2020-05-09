module.exports = {
  env: {},
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['tsconfig.json', './spec/tsconfig.json'],
  },
  plugins: ['@typescript-eslint'],

  rules: {
    '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'no-public' }],
    '@typescript-eslint/prefer-function-type': 'error',
    '@typescript-eslint/no-unused-vars': 'off',

    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['error', { functions: false }],

    // shloud be changed in the future
    '@typescript-eslint/member-ordering': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/consistent-type-assertions': 'off',
    'no-underscore-dangle': 'off',
    'no-case-declarations': 'off',
    '@typescript-eslint/camelcase': 'off',

    '@typescript-eslint/class-name-casing': 'error',
    '@typescript-eslint/no-empty-interface': 'error',
    '@typescript-eslint/no-inferrable-types': 'error',
    '@typescript-eslint/no-misused-new': 'error',
    '@typescript-eslint/no-namespace': 'error',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-require-imports': 'error',
    '@typescript-eslint/no-var-requires': 'error',
    '@typescript-eslint/unified-signatures': 'error',

    'default-case': 'error',
    'dot-notation': 'off',
    eqeqeq: ['error', 'always'],

    'max-classes-per-file': ['error', 1],
    'no-bitwise': 'error',
    'no-caller': 'error',
    'no-duplicate-imports': 'error',
    'no-eval': 'error',
    'no-invalid-this': 'error',
    'no-new-wrappers': 'error',
    'no-restricted-imports': ['error', 'rxjs/Rx'],
    'no-shadow': 'error',
    'no-throw-literal': 'error',
    'no-undef-init': 'error',
    'no-unused-expressions': ['error', { allowShortCircuit: true }],
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-const': 'error',
    'prefer-object-spread': 'error',
    'quote-props': ['error', 'as-needed'],
    radix: 'error',
    'spaced-comment': ['error', 'always', { markers: ['/', '!'] }],

    /*
    'import/no-default-export': 'error',
    'import/no-deprecated': 'error',
    'import/no-extraneous-dependencies': 'error',
    'import/order': 'error',
    'jsdoc/check-alignment': 'error',
    'jsdoc/check-indentation': 'error',
    'jsdoc/newline-after-description': 'error',
    'jsdoc/no-types': 'off',
    'prefer-arrow/prefer-arrow-functions': 'error',
    '@typescript-eslint/tslint/config': [
      'error',
      {
        rules: {
          encoding: true,
          'file-header': [
            true,
            'Copyright \\(c\\) \\d{4}',
            'Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>\n\nThis software is released under the MIT License.\nhttps://opensource.org/licenses/MIT',
          ],
          'prefer-conditional-expression': [true, 'check-else-if'],
          typedef: [true, 'call-signature', 'parameter', 'property-declaration'],
        },
      },
    ],
    */
  },
};
