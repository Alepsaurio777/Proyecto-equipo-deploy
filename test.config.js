module.exports = {
  testEnvironment: 'jsdom',
  testMatch: [
    '<rootDir>/test/**/*.js'
  ],
  transform: {
    '^.+\\.js$': 'babel-jest'
  }
};