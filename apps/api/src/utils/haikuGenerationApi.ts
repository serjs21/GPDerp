/** `prod`: real OpenAI agent stream. `dev`: local mock stream (no OpenAI calls, no cost). */
export type HaikuGenerationApi = "dev" | "prod";

export const HAIKU_GENERATION_API_KEY = "HAIKU_GENERATION_API";
const DEFAULT_HAIKU_GENERATION_API: HaikuGenerationApi = "dev";

/**
 * Reads HAIKU_GENERATION_API (default `dev`). Rejects unknown values, and `prod` without OPENAI_API_KEY,
 * so a misconfigured deployment fails at startup instead of on the first generation.
 */
export const parseHaikuGenerationApi = (source: NodeJS.ProcessEnv = process.env): HaikuGenerationApi => {
  const raw = source[HAIKU_GENERATION_API_KEY]?.trim() || DEFAULT_HAIKU_GENERATION_API;
  if (raw !== "dev" && raw !== "prod") {
    throw new Error(`Invalid environment variable ${HAIKU_GENERATION_API_KEY}: expected dev or prod`);
  }
  if (raw === "prod" && !source.OPENAI_API_KEY?.trim()) {
    throw new Error(`${HAIKU_GENERATION_API_KEY}=prod requires OPENAI_API_KEY`);
  }
  return raw;
};
