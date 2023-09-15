/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.[jt]s?(x)', '!**/*.d.ts'],
  moduleNameMapper: {
    "^@api$": "<rootDir>/src/api",
    "^@config$": "<rootDir>/src/config",
    "^@DTO$": "<rootDir>/src/DTO",
    "^@DTO/(.*)$": "<rootDir>/src/DTO/$1",
    "^@loaders": "<rootDir>/src/loaders",
    "^@services/(.*)$": "<rootDir>/src/services/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@errors/(.*)$": "<rootDir>/src/errors/$1",
    "^@errors$": "<rootDir>/src/errors",
    "^@routes/(.*)$": "<rootDir>/src/api/routes/$1",
    "^@hooks/(.*)$": "<rootDir>/src/api/hooks/$1",
  }
};
