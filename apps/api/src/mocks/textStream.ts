import { Readable } from "node:stream";

type ResponseCreatedEvent = {
  type: "response.created";
  sequence_number: number;
  response: {
    id: string;
    object: "response";
    created_at: number;
    status: "in_progress";
    model: string;
    output: any[];
    usage: null;
    metadata: Record<string, unknown>;
  };
};

type ResponseInProgressEvent = {
  type: "response.in_progress";
  sequence_number: number;
  response: { id: string; object: "response"; status: "in_progress" };
};

type OutputTextDeltaEvent = {
  type: "response.output_text.delta";
  sequence_number: number;
  item_id: string;
  output_index: number;
  content_index: number;
  delta: string;
};

type OutputTextDoneEvent = {
  type: "response.output_text.done";
  sequence_number: number;
  item_id: string;
  output_index: number;
  content_index: number;
  text: string;
};

type ResponseCompletedEvent = {
  type: "response.completed";
  sequence_number: number;
  response: {
    id: string;
    object: "response";
    created_at: number;
    status: "completed";
    completed_at: number;
    model: string;
    output: any[];
    usage: any; // keep loose; SDK fills this
    metadata: Record<string, unknown>;
  };
};

type OpenAIResponsesStreamEvent =
  | ResponseCreatedEvent
  | ResponseInProgressEvent
  | OutputTextDeltaEvent
  | OutputTextDoneEvent
  | ResponseCompletedEvent;

// small helper for timing
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const runHaikuAgentStreamMock = () => {
  const chunks = [
    "Cold streetlight hums\n",
    "Footsteps fade into the fog —\n",
    "A door left breathing.\n\n",
    "Rust on the lock sings\n",
    "Names peeled from forgotten bells,\n",
    "Moon counts the leftovers.\n\n",
    "Done.\n",
  ];

  let i = 0;

  return new Readable({
    read() {
      if (i >= chunks.length) {
        this.push(null); // end stream
        return;
      }

      const chunk = chunks[i++];
      setTimeout(() => {
        this.push(chunk);
      }, 150 + Math.random() * 300); // jitter like real streaming
    },
  });
}
