import type { RefObject } from "react";
import type { HeaderSearchView } from "./utils/headerSearchSourceUtils";

export type HeaderSearchInputProps = {
  view: HeaderSearchView;
  inputRef: RefObject<HTMLInputElement | null>;
};
