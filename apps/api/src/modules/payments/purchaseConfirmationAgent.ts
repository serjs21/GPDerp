import { readFileSync } from "node:fs";
import path from "node:path";
import { Agent, run } from "@openai/agents";

const INSTRUCTIONS_PATH = path.join(__dirname, "confirm_purchase_message.md");
const GENERATION_TIMEOUT_MS = 15_000;

let agent: Agent | null = null;

function purchaseConfirmationAgent(): Agent {
  agent ??= new Agent({
    name: "Purchase Confirmation Narrator",
    instructions: readFileSync(INSTRUCTIONS_PATH, "utf8"),
  });
  return agent;
}

/** Throws on model errors, timeout, or empty output — callers fall back to static copy. */
export async function generatePurchaseConfirmation(previousMessage: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GENERATION_TIMEOUT_MS);
  try {
    const result = await run(
      purchaseConfirmationAgent(),
      `Previous purchase-confirmation message:\n\n${previousMessage}`,
      { signal: controller.signal, maxTurns: 1 },
    );
    const text = typeof result.finalOutput === "string" ? result.finalOutput.trim() : "";
    if (!text) throw new Error("Empty purchase confirmation output");
    return text;
  } finally {
    clearTimeout(timer);
  }
}
