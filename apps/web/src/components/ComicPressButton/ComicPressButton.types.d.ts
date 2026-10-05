import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ComicPressButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};
