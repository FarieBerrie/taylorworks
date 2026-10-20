import { existsSync } from "node:fs";
import { defineConfig } from "prisma/config";

// With a config file, Prisma no longer reads .env by itself. Load it here so DATABASE_URL reaches
// the CLI and the seed script; hosts that set real environment variables have no .env to read.
if (existsSync(".env")) process.loadEnvFile(".env");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
