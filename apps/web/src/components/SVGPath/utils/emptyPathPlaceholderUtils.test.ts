import { emptyPathPlaceholderContent } from "./emptyPathPlaceholderUtils";

const t = (key: string) => `<${key}>`;

describe("emptyPathPlaceholderContent", () => {
  it("builds the untitled first-haiku placeholder", () => {
    const content = emptyPathPlaceholderContent("createFirst", t);
    expect(content.haiku.title).toBe("");
    expect(content.haiku.body).toBe("<emptyPlaceholder.body>");
    expect(content.ariaLabel).toBe("<emptyPlaceholder.ariaLabel>");
    expect(content.showArrow).toBe(true);
  });

  it("builds the titled email-verification placeholder", () => {
    const content = emptyPathPlaceholderContent("verifyEmail", t);
    expect(content.haiku.title).toBe("<verifyEmailPlaceholder.title>");
    expect(content.haiku.body).toBe("<verifyEmailPlaceholder.body>");
    expect(content.ariaLabel).toBe("<verifyEmailPlaceholder.ariaLabel>");
    expect(content.haiku.id).not.toBe(emptyPathPlaceholderContent("createFirst", t).haiku.id);
  });
});
