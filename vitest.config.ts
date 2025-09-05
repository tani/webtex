import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		include: ["test/**/*.ts", "test/**/*.js"],
		exclude: [
			"**/node_modules/**",
			"**/dist/**",
			"test/api/**/*.js",
			"test/api/**/*.mjs",
			"test/api/**/*.html",
			"test/lib/**",
			"test/types/**",
			"test/fixtures/**",
			"test/screenshots/**",
			"test/html/**",
			"test/**/__snapshots__/**",
		],
		setupFiles: ["test/lib/setup.ts"],
		// Test categorization via tags
		pool: "threads",
		poolOptions: {
			threads: {
				singleThread: false,
			},
		},
		// Snapshot configuration
		resolveSnapshotPath: (testPath: string, snapExtension: string) => {
			// Place snapshots in __snapshots__ folders next to test files
			const dir = path.dirname(testPath);
			const filename = path
				.basename(testPath)
				.replace(/\.(test|spec)\.(js|ts)$/, "");
			return path.join(dir, "__snapshots__", `${filename}${snapExtension}`);
		},
	},
});
