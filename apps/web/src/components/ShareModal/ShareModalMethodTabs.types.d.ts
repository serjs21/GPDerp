import type { ShareMethod } from "./types";

export type ShareModalMethodTabsProps = {
  method: ShareMethod;
  onChange: (method: ShareMethod) => void;
};
