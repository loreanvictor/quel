export default {
  preset: 'ts-jest',
  verbose: true,
  clearMocks: true,
  testEnvironment: 'jsdom',
  testMatch: ['**/test/*.test.[jt]s?(x)'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 90,
      lines: 100,
      statements: 100,
    },
  }
}
