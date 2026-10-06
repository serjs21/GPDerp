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
  });

  it("embeds only the back when there is no front", () => {
    const email = buildShareHaikuEmail({ ...base, postcard: { hasFront: false } });

    expect(email.html).not.toContain("cid:postcard-front");
    expect(email.html).toContain('src="cid:postcard-back"');
  });

  it("leaves the message and haiku text to the postcard images", () => {
    const email = buildShareHaikuEmail({ ...base, postcard: { hasFront: true } });

    expect(email.html).not.toContain("Wish you were here");
    expect(email.html).not.toContain("An old silent pond");
    expect(email.text).not.toContain("Wish you were here");
    expect(email.text).not.toContain("An old silent pond");
    expect(email.text).toContain("Create your own poem:");
  });

  it("renders the message and haiku as text without a postcard", () => {
    const email = buildShareHaikuEmail(base);

    expect(email.html).not.toContain("cid:postcard");
    expect(email.html).toContain("Wish you were here");
    expect(email.html).toContain("An old silent pond<br />A frog jumps in<br />Splash");
    expect(email.text).toContain("Few words from Aki:\nWish you were here\n\nOld pond\n\nAn old silent pond");
  });
});
