import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./src"),
    },
  },
  test: {
    environment: "node",
    globalSetup: "./tests/global-setup.ts",
    fileParallelism: false,
    env: {
      DATABASE_URL: `file:${path.resolve(process.cwd(), ".tmp/test.db")}`,
      SESSION_SECRET: "test-secret-that-is-at-least-32-characters",
      LOG_LEVEL: "silent",
    },
    exclude: [
      "**/node_modules/**",
      "**/e2e/**",
      "**/test-results/**",
      "**/playwright-report/**",
    ]
  },
});