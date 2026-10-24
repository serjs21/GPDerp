/** Gmail app width on a typical phone; desktop fills the story canvas. */
export const GMAIL_MOBILE_WIDTH_PX = 375;

export const GMAIL_DATE_LABEL = { desktop: "Tue, Oct 20, 2026, 9:41 AM", mobile: "9:41 AM" } as const;

export const GMAIL_FROM_FALLBACK = { name: "GPDerp", address: "MAIL_FROM is not set" } as const;

/** Profile photo of the sending Google account (poetic toaster), as Gmail shows it next to GPDerp mail. */
export const GMAIL_SENDER_AVATAR_SRC = "/email/sender_avatar.png";

export const GMAIL_BODY_TABS = [
  { id: "html", label: "HTML" },
  { id: "text", label: "Plain text" },
] as const;

/** Base styles of Gmail web's message body container (`.a3s`): the email inherits only these. */
export const GMAIL_BODY_CSS =
  "html,body{margin:0;padding:0;background:#fff;}" +
  "body{font:small/1.5 Arial,Helvetica,sans-serif;color:#222;overflow-wrap:break-word;}" +
  "a{color:#15c;}";

/** Material icon paths (Apache 2.0) for the Gmail chrome. */
export const GMAIL_ICON_PATHS = {
  back: "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z",
  archive:
    "M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z",
  delete: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
  unread:
    "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z",
  more:
    "M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z",
  reply: "M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z",
  star:
    "M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z",
} as const;

export const GMAIL_TOOLBAR_ICONS = ["back", "archive", "delete", "unread", "more"] as const;
