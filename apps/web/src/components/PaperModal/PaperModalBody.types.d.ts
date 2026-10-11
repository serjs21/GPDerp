import type { ReactNode } from "react";

export type PaperModalBodyProps = {
  title?: ReactNode;
  description?: string;
  showClose: boolean;
  children?: ReactNode;
  footer?: ReactNode;
};

export type PaperModalHeaderProps = {
  title?: ReactNode;
  showClose: boolean;
};
