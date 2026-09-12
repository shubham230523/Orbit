const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testMatch: ['**/tests/integration/**/*.test.(ts|tsx)'],
  testPathIgnorePatterns: [], // Clear ignore patterns for integration tests
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    '<rootDir>/jest.setup.js',
    '<rootDir>/tests/integration/setup.ts',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.{ts,tsx}',
    '!src/constants/**',
  ],
  coverageDirectory: 'coverage-integration',
};
