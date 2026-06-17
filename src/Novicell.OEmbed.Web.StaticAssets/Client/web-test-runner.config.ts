import { playwrightLauncher } from "@web/test-runner-playwright";

export default {
  files: "src/**/*.test.ts",
  nodeResolve: true,
  browsers: [playwrightLauncher({ product: "chromium" })],
  testFramework: {
    config: {
      timeout: 10000,
    },
  },
  coverageConfig: {
    reporters: ["text", "lcovonly"],
    exclude: ["node_modules/", "**/*.test.ts"],
  },
};
