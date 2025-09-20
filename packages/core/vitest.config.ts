import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Extend timeout for tests that may take longer due to code splitting and compilation
    testTimeout: 30000, // 30 seconds (default is 5 seconds)
    hookTimeout: 30000, // 30 seconds for setup/teardown hooks

    // Increase timeout for tests that spawn child processes (like CLI tests)
    slowTestThreshold: 10000, // 10 seconds to mark as slow

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
