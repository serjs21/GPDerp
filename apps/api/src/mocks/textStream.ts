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

export const runHaikuAgentStreamMock = (options?: {
  model?: string;
  id?: string;
  itemId?: string;
  minDelayMs?: number;
  maxDelayMs?: number;
}): AsyncIterable<OpenAIResponsesStreamEvent> => {
  const model = options?.model ?? "gpt-5";
  const respId = options?.id ?? "resp_mock_123";
  const itemId = options?.itemId ?? "msg_mock_123";
  const min = options?.minDelayMs ?? 60;
  const max = options?.maxDelayMs ?? 220;

  const fullText =
    "Hello there — streaming like OpenAI.\n" +
    "Words arrive in chunks,\n" +
    "sometimes with new lines.\n\n" +
    "Done.";

  // simulate “word-ish” chunks + newlines
  const deltas = [
    "Hello",
    " there",
    " —",
    " streaming",
    " like",
    " OpenAI.",
    "\n",
    "Words",
    " arrive",
    " in",
    " chunks,",
    "\n",
    "sometimes",
    " with",
    " new",
    " lines.",
    "\n\n",
    "Done.",
  ];

  return {
    async *[Symbol.asyncIterator]() {
      let seq = 1;
      const createdAt = Math.floor(Date.now() / 1000);

      // response.created (shape per API ref) :contentReference[oaicite:1]{index=1}
      yield {
        type: "response.created",
        sequence_number: seq++,
        response: {
          id: respId,
          object: "response",
          created_at: createdAt,
          status: "in_progress",
          model,
          output: [],
          usage: null,
          metadata: {},
        },
      };

      yield {
        type: "response.in_progress",
        sequence_number: seq++,
        response: { id: respId, object: "response", status: "in_progress" },
      };

      // stream text deltas (fields per API ref) :contentReference[oaicite:2]{index=2}
      let assembled = "";
      for (const d of deltas) {
        const jitter = Math.floor(min + Math.random() * (max - min));
        await sleep(jitter);

        assembled += d;

        yield {
          type: "response.output_text.delta",
          sequence_number: seq++,
          item_id: itemId,
          output_index: 0,
          content_index: 0,
          delta: d,
        };
      }

      // response.output_text.done (final text per API ref) :contentReference[oaicite:3]{index=3}
      yield {
        type: "response.output_text.done",
        sequence_number: seq++,
        item_id: itemId,
        output_index: 0,
        content_index: 0,
        text: assembled,
      };

      // response.completed (shape per API ref) :contentReference[oaicite:4]{index=4}
      const completedAt = Math.floor(Date.now() / 1000);
      yield {
        type: "response.completed",
        sequence_number: seq++,
        response: {
          id: respId,
          object: "response",
          created_at: createdAt,
          completed_at: completedAt,
          status: "completed",
          model,
          output: [], // SDK would contain output items; not needed for parsing text deltas
          usage: { input_tokens: 0, output_tokens: 0, total_tokens: 0 },
          metadata: {},
        },
      };
    },
  };
}
