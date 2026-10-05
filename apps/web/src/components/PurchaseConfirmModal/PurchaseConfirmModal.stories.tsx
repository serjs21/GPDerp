import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Button } from "@/components/StyledComponents";
import { PurchaseConfirmModal } from "./PurchaseConfirmModal";

const meta = {
  title: "Payments/PurchaseConfirmModal",
  component: PurchaseConfirmModal,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    open: true,
    onOpenChange: () => undefined,
    message: "TODO: purchase confirmed (first purchase)",
  },
} satisfies Meta<typeof PurchaseConfirmModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstPurchase: Story = {};

export const SecondPurchase: Story = {
  args: { message: "TODO: purchase confirmed (second purchase)" },
};

export const RepeatBuyer: Story = {
  args: { message: "TODO: purchase confirmed (3+ purchases)" },
};

export const LongMessage: Story = {
  args: {
    message:
      "Your scroll has been refilled with 100 fresh generations. The lanterns are lit, the ink is wet, and the next haiku is waiting for you whenever you are ready.",
  },
};

function InteractivePurchaseConfirmDemo() {
  const [open, setOpen] = useState(false);
  const [closes, setCloses] = useState(0);

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", gap: "0.75rem" }}>
      <p style={{ margin: 0, fontFamily: "cursive" }}>Closed: {closes}</p>
      <Button type="primary" onClick={() => setOpen(true)}>
        Open purchase confirmed
      </Button>
      <PurchaseConfirmModal
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setCloses((count) => count + 1);
        }}
        message="TODO: purchase confirmed (first purchase)"
      />
    </div>
  );
}

export const Interactive: Story = {
  args: { open: false },
  render: () => <InteractivePurchaseConfirmDemo />,
};
