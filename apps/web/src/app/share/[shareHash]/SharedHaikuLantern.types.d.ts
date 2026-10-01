import type { HaikuDto } from "@/api/haikus";

export type SharedHaikuLanternProps = {
  haiku: HaikuDto;
  /** Share link setting; when false the lantern renders without the label halo. */
  showLabels: boolean;
  subject: string;
};
