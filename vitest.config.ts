import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		include: ["test/**/*.ts", "test/**/*.js"],
		exclude: [
			"**/node_modules/**",
			"**/dist/**",
			"**/coverage/**",
			"test/api/**/*.js",
			"test/api/**/*.mjs", 
			"test/api/**/*.html",
			"test/lib/**",
			"test/types/**",
			"test/fixtures/**",
			"test/screenshots/**",
			"test/integration/**",
			"test/html/**",
		],
		setupFiles: ["test/lib/setup.ts"],
		// Test categorization via tags
		pool: "threads",
		poolOptions: {
			threads: {
				singleThread: false,
			},
		},
		coverage: {
			provider: "v8",
			reporter: ["text", "lcov", "html"],
			reportsDirectory: "./test/coverage",
			include: ["src/**/*.ts", "src/**/*.js"],
			exclude: ["src/**/*.d.ts", "src/**/*.test.ts", "src/**/*.spec.ts"],
		},
	},
});
