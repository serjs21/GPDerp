jest.mock("@openai/agents", () => ({
  Agent: jest.fn().mockImplementation((config) => config),
  run: jest.fn(),
}));

import { run } from "@openai/agents";
import { runHaikuAgentStream } from "../agent";

const runMock = run as unknown as jest.Mock;

const textStream = (deltas: string[]) =>
  new ReadableStream<string>({
    start(controller) {
      for (const delta of deltas) controller.enqueue(delta);
      controller.close();
    },
  });

describe("runHaikuAgentStream", () => {
  beforeEach(() => runMock.mockReset());

  it("yields each model text delta as its own chunk, then awaits run completion", async () => {
    let completedAwaited = false;
    runMock.mockResolvedValue({
      toTextStream: () => textStream(["Map", "le", " leaves", ",\n"]),
      completed: Promise.resolve().then(() => {
        completedAwaited = true;
      }),
    });

    const chunks: string[] = [];
    for await (const chunk of runHaikuAgentStream("autumn", { context: { uid: "tab", isProUser: true } })) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual(["Map", "le", " leaves", ",\n"]);
    expect(completedAwaited).toBe(true);
    expect(runMock).toHaveBeenCalledWith(expect.anything(), "autumn", expect.objectContaining({ stream: true }));
  });

  it("surfaces a failed run after the text ends", async () => {
    runMock.mockResolvedValue({
      toTextStream: () => textStream(["partial"]),
      completed: Promise.reject(new Error("model failed")),
    });

    const consume = async () => {
      for await (const chunk of runHaikuAgentStream("autumn")) void chunk;
    };
    await expect(consume()).rejects.toThrow("model failed");
  });
});
