import {
  consumePostLoginReturn,
  readPostLoginReturn,
  sanitizePostLoginReturn,
  savePostLoginReturn,
} from "./postLoginReturn";
import { POST_LOGIN_RETURN_STORAGE_KEY } from "@/config/userConfiguration";

describe("postLoginReturn", () => {
  beforeEach(() => {
    window.sessionStorage.removeItem(POST_LOGIN_RETURN_STORAGE_KEY);
  });

  it("sanitizes relative app paths and rejects open redirects", () => {
    expect(sanitizePostLoginReturn("/manage_labels?tab=1")).toBe("/manage_labels?tab=1");
    expect(sanitizePostLoginReturn("/settings#buy-generations")).toBe(
      "/settings#buy-generations",
    );
    expect(sanitizePostLoginReturn("https://evil.example/")).toBeNull();
    expect(sanitizePostLoginReturn("//evil.example/")).toBeNull();
    expect(sanitizePostLoginReturn("/login")).toBeNull();
    expect(sanitizePostLoginReturn("/register")).toBeNull();
  });

  it("saves once by default and overwrites when requested", () => {
    savePostLoginReturn("/manage_share_links");
    savePostLoginReturn("/settings");
    expect(readPostLoginReturn()).toBe("/manage_share_links");

    savePostLoginReturn("/settings", { overwrite: true });
    expect(readPostLoginReturn()).toBe("/settings");
  });

  it("consumes and clears the saved return", () => {
    savePostLoginReturn("/manage_labels");
    expect(consumePostLoginReturn()).toBe("/manage_labels");
    expect(readPostLoginReturn()).toBeNull();
    expect(consumePostLoginReturn("/")).toBe("/");
  });

  it("ignores auth-flow locations when saving", () => {
    savePostLoginReturn("/login");
    expect(readPostLoginReturn()).toBeNull();
  });
});
