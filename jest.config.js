/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.[jt]s?(x)', '!**/*.d.ts'],
  moduleNameMapper: {
    "^@api$": "<rootDir>/src/api",
    "^@config$": "<rootDir>/src/config",
    "^@DTO/(.*)$": "<rootDir>/src/DTO/$1",
    "^@loaders": "<rootDir>/src/loaders",
    "^@services/(.*)$": "<rootDir>/src/services/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
  }
};
