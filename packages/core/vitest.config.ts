import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Configure retry behavior for flaky tests
    retry: 1,

    // Improve test output
    reporters: ["verbose"],

    // Set maximum concurrent tests to avoid resource contention
    maxConcurrency: 4,

    // File parallelism - run test files concurrently
    fileParallelism: true,
  },
});
