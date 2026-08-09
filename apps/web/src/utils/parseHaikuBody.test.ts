import { EXAMPLE_HAIKU_BODY } from "@/storybook/fixtures/haikuBodies";
import { parseHaikuBody } from "./parseHaikuBody";

describe("parseHaikuBody", () => {
  it("extracts three lines and author from a production-shaped body", () => {
    const result = parseHaikuBody(EXAMPLE_HAIKU_BODY);

    expect(result.lines).toEqual([
      "Shadow questions rise,",
      'a void whispers, "Who are you?"',
      "Self slips through the cracks.",
    ]);
    expect(result.author).toBe("Jean-Paul Sartickle");
  });

  it("extracts author from an em-dash line", () => {
    const result = parseHaikuBody(`Line one here
Line two here
Line three here

—Holy Ghostwriter`);

    expect(result.lines).toEqual(["Line one here", "Line two here", "Line three here"]);
    expect(result.author).toBe("Holy Ghostwriter");
  });

  it("returns only haiku lines when no author suffix is present", () => {
    const result = parseHaikuBody(`Leaves fall —
Silence gathers on the path,
Winter waits ahead.`);

    expect(result.lines).toEqual([
      "Leaves fall —",
      "Silence gathers on the path,",
      "Winter waits ahead.",
    ]);
    expect(result.author).toBeUndefined();
  });

  it("pads to exactly three lines when fewer lines are provided", () => {
    const result = parseHaikuBody("Only one line");

    expect(result.lines).toEqual(["Only one line", "", ""]);
    expect(result.author).toBeUndefined();
  });

  it("slices to three lines when more than three content lines are provided", () => {
    const result = parseHaikuBody(`One
Two
Three
Four
Five`);

    expect(result.lines).toEqual(["One", "Two", "Three"]);
    expect(result.author).toBeUndefined();
  });
});
