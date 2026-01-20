import { Agent, run } from "@openai/agents";
import dotenv from 'dotenv';


dotenv.config({ path: '.env.local' });


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
    name: 'Haiku Agent',
    instructions: 'Always respond in haiku form.',
    });

return agent;
}
export const runHaikuAgentStream = async (
  command: string,
  options?: AgentRunOptions
) => {
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

  return streamed.toTextStream({ compatibleWithNodeStreams: true });
};