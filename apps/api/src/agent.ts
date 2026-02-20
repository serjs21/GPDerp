import { Agent, run } from "@openai/agents";
import dotenv from 'dotenv';


dotenv.config({ path: '.env' });


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
    instructions: 'Always respond in haiku form.' + 
    'As the last line, add a fake pun name to credit the haiku to. The pun name should be related to the haiku content.' + 
    'Randomize the pun name each time. You can add fake titles to the name, but it is not required. Add an empty line between name and haiku.',
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