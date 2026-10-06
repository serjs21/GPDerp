import { buildShareHaikuEmail } from "./shareHaikuTemplate";

const base = {
  senderName: "Aki",
  personalMessage: "Wish you were here",
  title: "Old pond",
  body: "An old silent pond\nA frog jumps in\nSplash",
};

describe("buildShareHaikuEmail", () => {
  it("embeds front and back postcard images by cid when a postcard is attached", () => {
    const email = buildShareHaikuEmail({ ...base, hasPostcard: true });

    expect(email.html).toContain('src="cid:postcard-front"');
    expect(email.html).toContain('src="cid:postcard-back"');
    expect(email.html.indexOf("cid:postcard-front")).toBeLessThan(email.html.indexOf("cid:postcard-back"));
    expect(email.text).toContain("postcard-front.png");
  });

  it("omits postcard images without a postcard", () => {
    const email = buildShareHaikuEmail(base);

    expect(email.html).not.toContain("cid:postcard");
    expect(email.text).not.toContain("postcard-front.png");
  });
});
