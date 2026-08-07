import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^.+\\/assets\\/route-split-segments-exact\\.svg\\.txt\\?raw$":
      "<rootDir>/tests/mocks/routeStopsSvgString.ts",
  },
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: {
          transform: {
            react: { runtime: "automatic" },
          },
        },
      },
    ],
  },
  testPathIgnorePatterns: ["/node_modules/", "<rootDir>/tests/playwright/"],
};

export default config;