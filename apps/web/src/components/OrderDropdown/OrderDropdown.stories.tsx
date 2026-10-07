"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { ORDER_SORT_DEFAULT_VALUE } from "./consts/orderDropdownConsts";
import { OrderDropdown } from "./OrderDropdown";
import type { OrderDropdownProps, OrderSortValue } from "./OrderDropdown.types";

const meta = {
  title: "Haiku/OrderDropdown",
  component: OrderDropdown,
  parameters: {
    layout: "centered",
  },
  args: {
    value: ORDER_SORT_DEFAULT_VALUE,
    onChange: () => {},
  },
  argTypes: {
    value: { control: false },
    onChange: { control: false },
  },
} satisfies Meta<typeof OrderDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

function StatefulOrderDropdown(props: Omit<OrderDropdownProps, "value" | "onChange">) {
  const [value, setValue] = useState<OrderSortValue>(ORDER_SORT_DEFAULT_VALUE);
  return (
    <div style={{ minHeight: "22rem", textAlign: "center" }}>
      <OrderDropdown {...props} value={value} onChange={setValue} />
      <p>
        sort: {value.categoryId ?? "none"} · {value.direction}
      </p>
    </div>
  );
}

export const Default: Story = {
  render: (args) => <StatefulOrderDropdown widthRem={args.widthRem} disabled={args.disabled} />,
};

export const Large: Story = {
  args: { widthRem: 8 },
  render: (args) => <StatefulOrderDropdown widthRem={args.widthRem} disabled={args.disabled} />,
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => <StatefulOrderDropdown widthRem={args.widthRem} disabled={args.disabled} />,
};
