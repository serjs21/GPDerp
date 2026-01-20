import { Agent, run } from "@openai/agents";
import dotenv from 'dotenv';


dotenv.config({ path: '.env.local' });


export interface Context {
  uid: string;  
  isProUser: boolean;
}

export interface AgentRunOptions {
    context?: Context;
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

export const runHaikuAgentStream = async (command: string, options?: AgentRunOptions ) => {
    const context = options?.context ?? { uid: 'anonymous', isProUser: true };
    const agent = beerMeAnHaikuAgent();
    const result =  await run(agent, command, { context, stream: true });
    return result.toTextStream({
    compatibleWithNodeStreams: true,
  });
}