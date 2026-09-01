import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Button } from "@/components/StyledComponents";
import { ComicToastItem } from "./ComicToastItem";
import { ComicToastProvider } from "./ComicToastProvider";
import { comicToast } from "./comicToast";
import { COMIC_TOAST_TONE_PRESETS } from "./comicToastPresets";
import type { ComicToastRecord } from "./comicToastState";

function ComicToastStoryShell() {
  return null;
}

const meta = {
  title: "Haiku/ComicToast",
  component: ComicToastStoryShell,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <ComicToastProvider>
        <Story />
      </ComicToastProvider>
    ),
  ],
} satisfies Meta<typeof ComicToastStoryShell>;

export default meta;
type Story = StoryObj<typeof meta>;

const staticToast = (tone: ComicToastRecord["tone"], content: string): ComicToastRecord => ({
  id: `static-${tone}`,
  tone,
  content,
  duration: 999_999,
  exiting: false,
});

export const AllTones: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))",
        gap: "1.25rem",
        width: "min(100%, 56rem)",
        margin: "2rem auto",
        padding: "0 1rem",
      }}
    >
      {(Object.keys(COMIC_TOAST_TONE_PRESETS) as Array<keyof typeof COMIC_TOAST_TONE_PRESETS>).map(
        (tone) => (
          <ComicToastItem
            key={tone}
            toast={staticToast(tone, `Tone: ${tone}`)}
            onDismiss={() => undefined}
            onRemove={() => undefined}
          />
        ),
      )}
    </div>
  ),
};

export const CaptionVsRectangle: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "1.5rem",
        padding: "2rem 1rem",
      }}
    >
      <ComicToastItem
        toast={staticToast("info", "A quiet note")}
        onDismiss={() => undefined}
        onRemove={() => undefined}
      />
      <ComicToastItem
        toast={staticToast("success", "Copied to clipboard")}
        onDismiss={() => undefined}
        onRemove={() => undefined}
      />
      <ComicToastItem
        toast={staticToast("warning", "Heads up!")}
        onDismiss={() => undefined}
        onRemove={() => undefined}
      />
      <ComicToastItem
        toast={staticToast("error", "Could not delete haiku.")}
        onDismiss={() => undefined}
        onRemove={() => undefined}
      />
    </div>
  ),
};

export const PilotMessages: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
        padding: "2rem 1rem",
      }}
    >
      <ComicToastItem
        toast={staticToast("success", "Copied to clipboard")}
        onDismiss={() => undefined}
        onRemove={() => undefined}
      />
      <ComicToastItem
        toast={staticToast("error", "Could not copy")}
        onDismiss={() => undefined}
        onRemove={() => undefined}
      />
      <ComicToastItem
        toast={staticToast("success", "Haiku deleted")}
        onDismiss={() => undefined}
        onRemove={() => undefined}
      />
      <ComicToastItem
        toast={staticToast("error", "You are not allowed to delete this haiku.")}
        onDismiss={() => undefined}
        onRemove={() => undefined}
      />
    </div>
  ),
};

function InteractiveComicToastDemo() {
  const [burst, setBurst] = useState(0);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        alignContent: "center",
        gap: "0.75rem",
      }}
    >
      <p style={{ margin: 0, fontFamily: "cursive" }}>Burst count: {burst}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
        <Button onClick={() => comicToast.info("A quiet note")}>Info</Button>
        <Button onClick={() => comicToast.success("Copied to clipboard")}>Success</Button>
        <Button onClick={() => comicToast.warning("Heads up!")}>Warning</Button>
        <Button onClick={() => comicToast.error("Could not delete haiku.")}>Error</Button>
        <Button
          type="primary"
          onClick={() => {
            setBurst((n) => n + 1);
            comicToast.success(`Toast burst #${burst + 1}`);
            comicToast.info("Stacking demo");
            comicToast.warning("Third in queue");
          }}
        >
          Stack toasts
        </Button>
      </div>
    </div>
  );
}

export const Interactive: Story = {
  render: () => <InteractiveComicToastDemo />,
};
