module.exports = {
  testEnvironment: 'jsdom',
  testMatch: [
    '<rootDir>/public/test/**/*.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/public/test/setup.js'],
  transform: {
    '^.+\\.js$': 'babel-jest'
  }
};