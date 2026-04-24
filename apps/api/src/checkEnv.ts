import "dotenv/config";
import { assertRequiredEnv } from "./utils/envSanity";

try {
  assertRequiredEnv();
  console.log("Environment sanity check passed.");
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
}
