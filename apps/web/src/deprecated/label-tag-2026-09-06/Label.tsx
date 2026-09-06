"use client";

import { Tag } from "@/components/StyledComponents";

export type LabelProps = {
  name: string;
  color: string;
  onClick?: () => void;
};

export function Label({ name, color, onClick }: LabelProps) {
  return (
    <Tag
      color={color || "default"}
      style={{ cursor: onClick ? "pointer" : "default", userSelect: "none" }}
      onClick={onClick}
    >
      {name}
    </Tag>
  );
}
