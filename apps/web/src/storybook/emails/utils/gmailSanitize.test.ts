import { sanitizeForGmail, sanitizeInlineStyle } from "./gmailSanitize";

describe("sanitizeForGmail", () => {
  it("keeps only the body and drops styles, scripts and head content", () => {
    const html = sanitizeForGmail(
      "<html><head><title>T</title><style>p{color:red}</style></head><body><p>Hi</p><script>alert(1)</script></body></html>",
    );

    expect(html).toBe("<p>Hi</p>");
  });

  it("removes inline event handlers", () => {
    expect(sanitizeForGmail('<img src="x.png" onerror="alert(1)">')).toBe('<img src="x.png">');
  });

  it("opens links in a new tab", () => {
    expect(sanitizeForGmail('<a href="https://example.com">go</a>')).toBe(
      '<a href="https://example.com" target="_blank" rel="noreferrer">go</a>',
    );
  });

  it("drops the style attribute when nothing survives", () => {
    expect(sanitizeForGmail('<div style="position:absolute;top:0">x</div>')).toBe("<div>x</div>");
  });
});

describe("sanitizeInlineStyle", () => {
  it("keeps supported declarations", () => {
    expect(sanitizeInlineStyle("margin:0 0 12px; color:#2c2c2c ;font-size:15px")).toBe(
      "margin:0 0 12px;color:#2c2c2c;font-size:15px",
    );
  });

  it("strips positioning, CSS variables and gradients", () => {
    expect(
      sanitizeInlineStyle(
        "position:relative;z-index:2;color:var(--ink);background-image:linear-gradient(160deg,#0000 60%,#00000008 60%);padding:4px",
      ),
    ).toBe("padding:4px");
  });

  it("drops a malformed declaration where two ran together", () => {
    expect(
      sanitizeInlineStyle("padding:24px;background-color:background: linear-gradient(135deg, #ff7c68, #2c1e1e);color:#222"),
    ).toBe("padding:24px;color:#222");
  });

  it("does not split on semicolons inside url()", () => {
    expect(sanitizeInlineStyle("background:url(data:image/png;base64,AAAA) no-repeat")).toBe(
      "background:url(data:image/png;base64,AAAA) no-repeat",
    );
  });
});
