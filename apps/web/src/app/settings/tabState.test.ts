import {
  parseProfileTab,
  profileTabRedirect,
  profileTabSwitchQuery,
  shouldApplyServerPreference,
} from "./tabState";

describe("shouldApplyServerPreference", () => {
  it("applies server value when client has no stored preference and server value is valid", () => {
    expect(
      shouldApplyServerPreference({ hasClientPreference: false, isValidServerValue: true }),
    ).toBe(true);
  });

  it("does not apply when client already chose a preference", () => {
    expect(
      shouldApplyServerPreference({ hasClientPreference: true, isValidServerValue: true }),
    ).toBe(false);
  });

  it("does not apply when server value is invalid", () => {
    expect(
      shouldApplyServerPreference({ hasClientPreference: false, isValidServerValue: false }),
    ).toBe(false);
  });
});

describe("parseProfileTab", () => {
  it("keeps known tabs and falls back to profile", () => {
    expect(parseProfileTab("labels")).toBe("labels");
    expect(parseProfileTab("share-links")).toBe("share-links");
    expect(parseProfileTab("tokens")).toBe("profile");
    expect(parseProfileTab(null)).toBe("profile");
  });
});

describe("profileTabRedirect", () => {
  it("redirects legacy and unknown tab params", () => {
    expect(profileTabRedirect("settings", "profile")).toBe("/settings?tab=profile");
    expect(profileTabRedirect("tokens", "profile")).toBe("/settings?tab=profile#buy-generations");
    expect(profileTabRedirect("nope", "profile")).toBe("/settings?tab=profile");
  });

  it("leaves valid or missing tab params alone", () => {
    expect(profileTabRedirect("labels", "labels")).toBeNull();
    expect(profileTabRedirect(null, "profile")).toBeNull();
  });
});

describe("profileTabSwitchQuery", () => {
  it("clears search on every switch and list filters outside share-links", () => {
    const query = "tab=share-links&search=x&filter=active&sort=created&dir=asc";
    expect(profileTabSwitchQuery(query, "labels")).toBe("tab=labels");
    expect(profileTabSwitchQuery(query, "share-links")).toBe(
      "tab=share-links&filter=active&sort=created&dir=asc",
    );
  });
});
