import type { ConnectedHaikusPanelProps } from "./ConnectedHaikusPanel";

export type ManageLabelConnectionsProps = Pick<
  ConnectedHaikusPanelProps,
  "accountId" | "labelName" | "items" | "total"
> & {
  /** When true the panel becomes a "tune in" button that filters the home feed by this label. */
  hasConnections: boolean;
  onTuneIn: () => void;
};
