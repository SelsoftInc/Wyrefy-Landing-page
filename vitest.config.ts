import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      reportsDirectory: "./coverage",
      include: ["app/**/*.{ts,tsx}", "src/**/*.{ts,tsx}"],
      exclude: [
        "**/*.d.ts",
        "**/*.test.*",
        "**/*.spec.*",
        "test/**",
        "coverage/**",
        ".scannerwork/**",
        "**/node_modules/**",
        "next-env.d.ts",
        "vitest.config.ts",
        "eslint.config.mjs",
        "postcss.config.mjs",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
