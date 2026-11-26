// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    rules: {
      'import/no-unresolved': 'off',
      'react/no-unescaped-entities': 'off',
      // Keep SDK 57 compiler guidance visible while making incremental cleanup non-blocking.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
    },
  },
  {
    ignores: ['dist/*'],
    rules: {
      'import/no-unresolved': 'off',
      'react/no-unescaped-entities': 'off',
    },
  },
]);
