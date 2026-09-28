/** Root font size used to convert rem to measured px. */
export const TICKET_ROOT_FONT_PX = 16;

/** Ticket thickness never exceeds this (rem). */
export const TICKET_MAX_THICKNESS_REM = 5;

/** label_ticket_base.svg viewBox (1266 x 328.51): length / thickness, kept at every angle. */
export const TICKET_ASPECT_RATIO = 1266 / 328.51;

/** Share of the stage (each axis) the rotated ticket may occupy; 4% inset per side. */
export const TICKET_INSET_RATIO = 0.92;

/** Rotation cap: fully portrait stages turn the ticket by this much. */
export const TICKET_MAX_ANGLE_DEG = 90;
