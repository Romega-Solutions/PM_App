// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    rules: {
      'import/no-unresolved': 'off',
      'react/no-unescaped-entities': 'off',
      // These compiler rules were added by the SDK 57 lint preset and flag
      // established async-loading and Reanimated ref patterns across the app.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
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
