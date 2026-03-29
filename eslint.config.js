import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  ignores: ['dist', 'node_modules'],
  rules: {
    'no-console': 'off',
    'unused-imports/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
})
