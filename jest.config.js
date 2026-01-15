module.exports = {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/jest.setup.js"],
  transform: {
    "^.+\\.(ts|tsx)$": "babel-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
  ],
  testMatch: ["**/__tests__/**/*.test.{ts,tsx}"],
  testTimeout: 10000,
};
