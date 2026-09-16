import { parseGenerationCreditsMessage } from "./parseGenerationCreditsMessage";

describe("parseGenerationCreditsMessage", () => {
  it("reads a generation_credits payload", () => {
    expect(
      parseGenerationCreditsMessage(JSON.stringify({ kind: "generation_credits", data: { credits: 9 } })),
    ).toEqual({ credits: 9 });
  });

  it("ignores other socket kinds", () => {
    expect(parseGenerationCreditsMessage(JSON.stringify({ kind: "saved", data: { haiku: { id: "1" } } }))).toBeNull();
    expect(parseGenerationCreditsMessage("not-json")).toBeNull();
  });
});
