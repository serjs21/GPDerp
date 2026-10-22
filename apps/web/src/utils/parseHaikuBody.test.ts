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

  it("keeps all three lines when the model puts the credit first without a dash", () => {
    const result = parseHaikuBody(
      "Professor I.M. Soggy\n\nRain clouds fill my mind,  \nHope drips down the windowsill—  \nEven sunshine hides.",
    );

    expect(result.lines).toEqual(["Rain clouds fill my mind,", "Hope drips down the windowsill—", "Even sunshine hides."]);
    expect(result.author).toBe("Professor I.M. Soggy");
  });

  it("extracts an en-dash credit", () => {
    const result = parseHaikuBody("Maple leaves whisper,  \nRaindrops tap on windowpanes—  \nFall sighs wet goodbye.  \n\n– Misty Drizzlewood");

    expect(result.lines).toEqual(["Maple leaves whisper,", "Raindrops tap on windowpanes—", "Fall sighs wet goodbye."]);
    expect(result.author).toBe("Misty Drizzlewood");
  });

  it("extracts a dashless credit set apart after the poem", () => {
    const result = parseHaikuBody("One line here\nTwo line here\nThree line here\n\nHaik U. Wonder");

    expect(result.lines).toEqual(["One line here", "Two line here", "Three line here"]);
    expect(result.author).toBe("Haik U. Wonder");
  });

  it("does not guess a credit from a half-streamed body", () => {
    const result = parseHaikuBody("Professor I.M. Soggy\n\nRain clouds");

    expect(result.lines).toEqual(["Professor I.M. Soggy", "Rain clouds", ""]);
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
