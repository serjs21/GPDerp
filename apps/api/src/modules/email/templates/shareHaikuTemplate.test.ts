import { buildShareHaikuEmail } from "./shareHaikuTemplate";

const base = {
  senderName: "Aki",
  personalMessage: "Wish you were here",
  title: "Old pond",
  body: "An old silent pond\nA frog jumps in\nSplash",
};

describe("buildShareHaikuEmail", () => {
  it("embeds front then back postcard images by cid when the front is present", () => {
    const email = buildShareHaikuEmail({ ...base, postcard: { hasFront: true } });

    expect(email.html).toContain('src="cid:postcard-front"');
    expect(email.html).toContain('src="cid:postcard-back"');
    expect(email.html.indexOf("cid:postcard-front")).toBeLessThan(email.html.indexOf("cid:postcard-back"));
    expect(email.text).toContain("postcard-front.png");
  });

  it("embeds only the back when there is no front", () => {
    const email = buildShareHaikuEmail({ ...base, postcard: { hasFront: false } });

    expect(email.html).not.toContain("cid:postcard-front");
    expect(email.html).toContain('src="cid:postcard-back"');
    expect(email.text).toContain("postcard-back.png");
    expect(email.text).not.toContain("postcard-front.png");
  });

  it("omits postcard images without a postcard", () => {
    const email = buildShareHaikuEmail(base);

    expect(email.html).not.toContain("cid:postcard");
    expect(email.text).not.toContain("postcard-front.png");
  });
});
