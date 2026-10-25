import { isProduction, productionConfigProblems } from "@/lib/env";

/**
 * Called once from instrumentation.ts when the server starts (Node.js only). In production, a
 * missing or placeholder AUTH_SECRET makes the server exit, so on Render the deploy fails and the
 * previous version keeps serving; anything else that's missing is logged as a warning.
 */
export function checkProductionConfig() {
  if (!isProduction()) return;
  const { fatal, warnings } = productionConfigProblems();
  for (const warning of warnings) console.warn(`[config] ${warning}`);
  if (fatal.length === 0) return;
  for (const problem of fatal) console.error(`[config] ${problem}`);
  // Throwing from register() only makes Next answer every request with an error; exiting fails the deploy
  console.error("[config] Refusing to start until this is fixed.");
  process.exit(1);
}
