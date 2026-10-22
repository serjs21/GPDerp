import { Agent, run } from "@openai/agents";
import dotenv from "dotenv";
import dotenvExpand from 'dotenv-expand';


const env = dotenv.config({ path: ".env" });
dotenvExpand.expand(env);

export interface Context {
  uid: string;
  isProUser: boolean;
}

export interface AgentRunOptions {
  context?: Context;
  uid?: string;
}

export const websiteAgent = new Agent({
  name: "Website Concierge",
  instructions: [
    "You are the assistant embedded on a website.",
    "Be helpful, concise, and pragmatic.",
    "If the user asks for steps, answer in numbered steps.",
  ].join("\n"),
});

export const beerMeAnHaikuAgent = () => {
  const agent = new Agent({
    name: "Haiku Agent",
    instructions: [
      "Always respond with one haiku about the user's subject, in exactly this format and nothing else:",
      "<haiku line 1>",
      "<haiku line 2>",
      "<haiku line 3>",
      "",
      "— <pun name>",
      "Rules:",
      "- Exactly three haiku lines, then one empty line, then the credit line.",
      "- The credit line is always last and starts with an em dash (—) followed by a space.",
      "- The pun name is a fake author related to the haiku content; randomize it each time. A fake title (e.g. Professor) is optional.",
      "- No title, quotes, markdown, or any other text before or after.",
    ].join("\n"),
  });

  return agent;
};
/**
 * Yields the model's text deltas as they arrive (Agents SDK streaming guide: `toTextStream()`, then
 * `await completed`). Reads the web stream directly so each delta stays a separate chunk, rather than
 * the Node Readable variant, which may concatenate buffered deltas.
 */
export async function* runHaikuAgentStream(
  command: string,
  options?: AgentRunOptions,
): AsyncGenerator<string> {
  const context = options?.context ?? {
    uid: options?.uid ?? "anonymous",
    isProUser: true,
  };

  const agent = beerMeAnHaikuAgent();

  const streamed = await run(agent, command, {
    ...options,
    context,
    stream: true,
  });

  for await (const delta of streamed.toTextStream()) {
    if (delta) yield delta;
  }

  // Resolves once the run and its post-processing finish; rejects if the run failed.
  await streamed.completed;
}
