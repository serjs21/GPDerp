import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Button } from "@/components/StyledComponents";
import { PurchaseMessagePicker } from "@/storybook/purchaseMessages/PurchaseMessagePicker";
import {
  loadDevPurchaseMessages,
  type DevPurchaseMessage,
  type DevPurchaseMessages,
} from "@/storybook/purchaseMessages/devPurchaseMessages";
import { NoGenerationsLeftModal } from "./NoGenerationsLeftModal";

const meta = {
  title: "Payments/NoGenerationsLeftModal",
  component: NoGenerationsLeftModal,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    open: true,
    onOpenChange: () => undefined,
    message: "TODO: no generations left (0 purchases)",
    onBuy: () => undefined,
    buying: false,
    buyDisabled: false,
  },
} satisfies Meta<typeof NoGenerationsLeftModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstTime: Story = {};

export const OnePurchase: Story = {
  args: { message: "TODO: no generations left (1 purchase)" },
};

export const RepeatBuyer: Story = {
  args: { message: "TODO: no generations left (2+ purchases)" },
};

export const Buying: Story = {
  args: { buying: true },
};

export const CheckoutUnavailable: Story = {
  args: { buyDisabled: true },
};

export const LongMessage: Story = {
  args: {
    message:
      "You have written every haiku your scroll could hold. Grab another bundle of generations to keep the lanterns glowing — credits land as soon as the payment is confirmed.",
  },
};

function InteractiveNoGenerationsLeftDemo() {
  const [open, setOpen] = useState(false);
  const [buys, setBuys] = useState(0);

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", gap: "0.75rem" }}>
      <p style={{ margin: 0, fontFamily: "cursive" }}>Buy clicks: {buys}</p>
      <Button type="primary" onClick={() => setOpen(true)}>
        Open no generations left
      </Button>
      <NoGenerationsLeftModal
        open={open}
        onOpenChange={setOpen}
        message="TODO: no generations left (0 purchases)"
        onBuy={() => setBuys((count) => count + 1)}
      />
    </div>
  );
}

export const Interactive: Story = {
  args: { open: false },
  render: () => <InteractiveNoGenerationsLeftDemo />,
};

function ApiMessagesNoGenerationsLeftDemo({ messages }: { messages: DevPurchaseMessages }) {
  const [picked, setPicked] = useState<DevPurchaseMessage | null>(null);

  return (
    <>
      <PurchaseMessagePicker
        title="Out of generations — API messages"
        items={messages.ok ? messages.noGenerationsLeft : null}
        error={messages.ok ? undefined : messages.error}
        onPick={setPicked}
      />
      <NoGenerationsLeftModal
        open={picked !== null}
        onOpenChange={(next) => {
          if (!next) setPicked(null);
        }}
        message={picked?.message ?? ""}
        onBuy={() => setPicked(null)}
      />
    </>
  );
}

/** Messages from the dev-only `GET /dev/purchase-messages` route (requires the local API). */
export const FromApi: Story = {
  args: { open: false },
  loaders: [async () => ({ messages: await loadDevPurchaseMessages() })],
  render: (_args, { loaded }) => (
    <ApiMessagesNoGenerationsLeftDemo messages={loaded.messages as DevPurchaseMessages} />
  ),
};