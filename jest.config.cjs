/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/tests", "<rootDir>/src"],
  setupFilesAfterEnv: ["<rootDir>/tests/setupTests.ts"],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: "<rootDir>/tests/tsconfig.json" }],
  },
  moduleNameMapper: {
    "\\.(css|scss|sass|less)$": "identity-obj-proxy",
    "\\.(png|jpe?g|gif|svg|webp|avif|ttf|woff2?)$": "<rootDir>/tests/__mocks__/fileMock.js",
    "^.+/security/jwt$": "<rootDir>/src/mocks/security/jwt.test-double.ts",
  },
  testMatch: ["**/?(*.)+(spec|test).[tj]s?(x)"],
  clearMocks: true,
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/build/"],
};
