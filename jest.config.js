module.exports = {

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // A set of global variables that need to be available in all test environments
  globals: {
    'ts-jest': {
      'tsConfigFile': 'tsconfig.json'
    }
  },
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js'
  ],

  moduleNameMapper: {
    'boclips-js-security': '<rootDir>/__mocks__/boclipsJsSecurityMock.js',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|less)$': '<rootDir>/__mocks__/styleMock.js'
  },

  // The test environment that will be used for testing
  testEnvironment: 'node',

  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/*.(integrationTest|test).(ts|tsx|js)'
  ],

  testPathIgnorePatterns: [
    "node_modules",
    "dist"
  ],

  // A map from regular expressions to paths to transformers
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
};
