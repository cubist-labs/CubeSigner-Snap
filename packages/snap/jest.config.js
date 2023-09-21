module.exports = {
  preset: '@metamask/snaps-jest',
  testTimeout: 15000,
  testMatch: ["**/test/**/*.test.ts"],
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest',
  },
};
