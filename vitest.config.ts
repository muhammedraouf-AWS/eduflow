import { config } from "dotenv";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// Load .env.local so integration tests can reach the DB
config({ path: ".env.local" });

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    setupFiles: ["src/test/setup.ts"],
    globals: true,
    // Layer 2 integration tests hit a real DB — give them more time
    testTimeout: 15_000,
    hookTimeout: 15_000,
    // Run test files sequentially so integration tests don't race on the shared DB
    fileParallelism: false,
    server: {
      deps: {
        // Process next-auth through Vite so ESM/CJS resolution works in Node
        inline: ["next-auth", "@auth/core"],
      },
    },
  },
});
