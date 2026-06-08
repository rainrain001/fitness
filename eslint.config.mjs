// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import eslintConfigPrettier from 'eslint-config-prettier/flat'

export default withNuxt([
  {
    ignores: ['**/app/components/ui/**/*.ts', '**/app/components/ui/**/*.vue']
  },
  {
    rules: {
      semi: 'off',
      quotes: ['error', 'single'],
      indent: ['error', 2],
      'no-console': 'off',
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-undef-init': 'off',
      'array-bracket-newline': ['error', { multiline: true, minItems: 2 }],
      'vue/multi-word-component-names': 'off',
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/no-setup-props-destructure': 'off',
      'vue/no-multiple-template-root': 'off'
    }
  },
  eslintConfigPrettier
])
