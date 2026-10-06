import { POSTCARD_MESSAGE_MAX_LINES, POSTCARD_PNG_HEIGHT, POSTCARD_PNG_WIDTH } from "../../../consts/postcard";
import { readPngSize } from "../../../utils/postcardImage";
import { PostcardMessageTooLongError, renderPostcardBackPng } from "../postcardBackRenderer";

describe("renderPostcardBackPng", () => {
  it("renders a PNG at the same size as the browser-rendered front", async () => {
    const png = await renderPostcardBackPng({
      message: "I saw this lantern & had to send it to you!\nWish you were here.",
      senderName: "Aki",
      recipient: "tony.kim@example.com",
    });

    expect(readPngSize(png)).toEqual({ width: POSTCARD_PNG_WIDTH, height: POSTCARD_PNG_HEIGHT });
  }, 30_000);

  it("refuses a message that needs more lines than the card holds", async () => {
    const message = Array.from({ length: POSTCARD_MESSAGE_MAX_LINES + 1 }, () => "line").join("\n");

    await expect(renderPostcardBackPng({ message, senderName: "Aki", recipient: "a@example.com" })).rejects.toThrow(
      PostcardMessageTooLongError,
    );
  });
});
