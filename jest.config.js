// eslint-disable-next-line tsdoc/syntax
/** @type {import('ts-jest').JestConfigWithTsJest} */
// eslint-disable-next-line no-undef
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@simulation/agents/(.*)$': '<rootDir>/src/simulation/agents/$1',
    '^@simulation/api/(.*)$': '<rootDir>/src/simulation/api/$1',
    '^@simulation/config/(.*)$': '<rootDir>/src/simulation/config/$1',
    '^@simulation/docs/(.*)$': '<rootDir>/src/simulation/docs/$1',
    '^@simulation/mockedAPI/(.*)$': '<rootDir>/src/simulation/mockedAPI/$1',
    '^@simulation/model/(.*)$': '<rootDir>/src/simulation/model/$1',
    '^@simulation/router/(.*)$': '<rootDir>/src/simulation/router/$1',
    '^@simulation/service/(.*)$': '<rootDir>/src/simulation/service/$1',
    '^@simulation/validator/(.*)$': '<rootDir>/src/simulation/validator/$1',
    '^@evaluation/api/(.*)$': '<rootDir>/src/evaluation/api/$1',
    '^@evaluation/docs/(.*)$': '<rootDir>/src/evaluation/docs/$1',
    '^@evaluation/model/(.*)$': '<rootDir>/src/evaluation/model/$1',
    '^@evaluation/router/(.*)$': '<rootDir>/src/evaluation/router/$1',
    '^@evaluation/service/(.*)$': '<rootDir>/src/evaluation/service/$1',
    '^@evaluation/utils/(.*)$': '<rootDir>/src/evaluation/utils/$1',
    '^@evaluation/validator/(.*)$': '<rootDir>/src/evaluation/validator/$1',
    '^@enums/(.*)$': '<rootDir>/src/enums/$1',
    '^@db/models/(.*)$': '<rootDir>/src/db/models/$1',
    '^@db/repositories/(.*)$': '<rootDir>/src/db/repositories/$1',
    '^@db/config/(.*)$': '<rootDir>/src/db/config/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  },
};
