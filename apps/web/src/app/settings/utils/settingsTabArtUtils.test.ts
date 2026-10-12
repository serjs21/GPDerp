import { settingsTabArtSrcs } from "./settingsTabArtUtils";

const TAB_ICONS = ["/profile/profile.svg", "/profile/share_link.svg", "/profile/labels.svg"];

describe("settingsTabArtSrcs", () => {
  it("profile tab: only the tab strip", () => {
    expect(settingsTabArtSrcs("profile", "en")).toEqual(TAB_ICONS);
  });

  it("share-links tab: sort covers and filter icons, no labels art", () => {
    const srcs = settingsTabArtSrcs("share-links", "en");
    expect(srcs).toEqual(expect.arrayContaining([...TAB_ICONS, "/sort_button/time_cover.svg"]));
    expect(srcs).toContain("/share_links_filter/active.svg");
    expect(srcs).not.toContain("/create_label_button_base/label_ticket_base.svg");
    expect(srcs).not.toContain("/sort_button/connections_cover.svg");
  });

  it("labels tab: label sort covers and the create ticket, no share-links art", () => {
    const srcs = settingsTabArtSrcs("labels", "en");
    expect(srcs).toContain("/sort_button/creation_date_cover_labels.svg");
    expect(srcs).toContain("/create_label_button_base/label_ticket_base.svg");
    expect(srcs).not.toContain("/share_links_filter/active.svg");
  });

  it("uses the locale's cover variant only", () => {
    const ja = settingsTabArtSrcs("share-links", "ja");
    expect(ja).toContain("/sort_button/creation_date_cover_labels.svg");
    expect(ja).not.toContain("/sort_button/time_cover.svg");
  });
});
