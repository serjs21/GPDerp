"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState, type ReactNode } from "react";
import {
  SortButtonsCluster,
  type SortButtonsCategory,
  type SortButtonsValue,
} from "./SortButtonsCluster";
import type { SortDirection } from "./consts/sortButtonsConsts";

function SortIcon({ src, alt }: { src: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static public SVG
    <img src={src} alt={alt} width={24} height={24} draggable={false} decoding="async" />
  );
}

function LetterIcon({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        fontSize: "0.78rem",
        fontWeight: 700,
        letterSpacing: "0.02em",
        lineHeight: 1,
      }}
    >
      {children}
    </span>
  );
}

const PREVIEW_CATEGORIES: SortButtonsCategory[] = [
  {
    id: "date",
    label: "Date",
    startIcon: <SortIcon src="/sort_button/time_new.svg" alt="" />,
    endIcon: <SortIcon src="/sort_button/time_old.svg" alt="" />,
    ariaLabel: "Sort by date",
  },
  {
    id: "name",
    label: "Name",
    startIcon: <LetterIcon>A</LetterIcon>,
    endIcon: <LetterIcon>Z</LetterIcon>,
    ariaLabel: "Sort by name",
  },
];

const meta = {
  title: "Haiku/SortButtonsCluster",
  component: SortButtonsCluster,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    categories: PREVIEW_CATEGORIES,
    value: { categoryId: "date", direction: "asc" as SortDirection },
    "aria-label": "Sort haikus",
  },
  argTypes: {
    onChange: { action: "onChange" },
    value: { control: false },
    categories: { control: false },
  },
} satisfies Meta<typeof SortButtonsCluster>;

export default meta;
type Story = StoryObj<typeof meta>;

function StatefulCluster({
  initial,
  categories = PREVIEW_CATEGORIES,
}: {
  initial: SortButtonsValue;
  categories?: SortButtonsCategory[];
}) {
  const [value, setValue] = useState<SortButtonsValue>(initial);
  return (
    <div style={{ display: "grid", gap: "0.75rem", justifyItems: "center" }}>
      <SortButtonsCluster
        categories={categories}
        value={value}
        onChange={setValue}
        aria-label="Sort haikus"
      />
      <p
        style={{
          margin: 0,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: "0.75rem",
          opacity: 0.72,
        }}
      >
        {value.categoryId} · {value.direction}
      </p>
    </div>
  );
}

export const Default: Story = {
  render: () => <StatefulCluster initial={{ categoryId: "date", direction: "asc" }} />,
};

export const NameSelected: Story = {
  render: () => <StatefulCluster initial={{ categoryId: "name", direction: "asc" }} />,
};

export const Descending: Story = {
  render: () => <StatefulCluster initial={{ categoryId: "date", direction: "desc" }} />,
};

export const DateOnly: Story = {
  render: () => (
    <StatefulCluster
      initial={{ categoryId: "date", direction: "asc" }}
      categories={[PREVIEW_CATEGORIES[0]!]}
    />
  ),
};
