import { Readable } from "node:stream";
import _ from "lodash-es";
import { HAIKU_STREAM_CHAR_DELAY_MAX_MS, HAIKU_STREAM_CHAR_DELAY_MIN_MS } from "../consts/haiku";

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
    metadata: Record<string, unknown>;
  };
};

type OpenAIResponsesStreamEvent =
  | ResponseCreatedEvent
  | ResponseInProgressEvent
  | OutputTextDeltaEvent
  | OutputTextDoneEvent
  | ResponseCompletedEvent;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const HAIKUS = [
  `Shadow questions rise,
a void whispers, "Who are you?"
Self slips through the cracks.

-Jean-Paul Sartickle`,

  `Nietzsche’s whisper fades,
Empty sky and silent bells—
Doubt’s garden grows wild.

—Holy Ghostwriter`,

  `Infernal flames burn,
Whispers echo endless pain—
Hope lost to the void.

— Dante Fuego`,
];

export const randomHaiku = () => _.sample(HAIKUS)!;

export const streamChunks = (mode: "char" | "word" = "char") =>
  mode === "word"
    ? _.words(randomHaiku(), /[^\s]+|\s+/g)
    : Array.from(randomHaiku());

export const runHaikuAgentStreamMock = () => {
  const chunks = randomHaiku();

  let i = 0;

  return new Readable({
    read() {
      if (i >= chunks.length) {
        this.push(null);
        return;
      }

      const chunk = chunks[i++];
      setTimeout(
        () => {
          this.push(chunk);
        },
        HAIKU_STREAM_CHAR_DELAY_MIN_MS +
          Math.random() * (HAIKU_STREAM_CHAR_DELAY_MAX_MS - HAIKU_STREAM_CHAR_DELAY_MIN_MS),
      );
    },
  });
};
