import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { composeDecorators, withFullscreenShell, withQueryClient } from "@/storybook";
import { HaikuGenerationStickyNote } from "./HaikuGenerationStickyNote";
import { HaikuGenerationStickyNoteInitial } from "./HaikuGenerationStickyNoteInitial/HaikuGenerationStickyNoteInitial";
import { HaikuGenerationStickyNoteInput } from "./HaikuGenerationStickyNoteInput/HaikuGenerationStickyNoteInput";
import styles from "./HaikuGenerationStickyNote.module.css";

const meta: Meta<typeof HaikuGenerationStickyNote> = {
  title: "Archive/Haiku/HaikuGenerationStickyNote",
  component: HaikuGenerationStickyNote,
  decorators: [composeDecorators(withQueryClient, withFullscreenShell)],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof HaikuGenerationStickyNote>;

function StoryShell({
  children,
  inputAlignment,
}: {
  children: React.ReactNode;
  inputAlignment?: "bottom-center" | "bottom-start" | "bottom-end";
}) {
  const inputClass = [
    styles.inputSection,
    styles.inputSectionStickyBottom,
    inputAlignment === "bottom-start"
      ? styles.inputAlignStart
      : inputAlignment === "bottom-end"
        ? styles.inputAlignEnd
        : styles.inputAlignCenter,
  ].join(" ");

  return <div className={inputClass}>{children}</div>;
}

export const InitialOnly: Story = {
  render: function InitialOnlyStory() {
    return (
      <div className={styles.wrapper}>
        <div className={styles.displayArea}>
          <HaikuGenerationStickyNoteInitial />
        </div>
      </div>
    );
  },
};

export const InputOnly: Story = {
  render: function InputOnlyStory() {
    const [subject, setSubject] = useState("");

    return (
      <div className={styles.wrapper}>
        <StoryShell>
          <HaikuGenerationStickyNoteInput
            subject={subject}
            onSubjectChange={setSubject}
            onSubmit={(e) => e.preventDefault()}
          />
        </StoryShell>
      </div>
    );
  },
};

export const InputLoading: Story = {
  render: function InputLoadingStory() {
    const [subject, setSubject] = useState("Autumn wind");

    return (
      <div className={styles.wrapper}>
        <StoryShell>
          <HaikuGenerationStickyNoteInput
            subject={subject}
            onSubjectChange={setSubject}
            onSubmit={(e) => e.preventDefault()}
            isLoading
          />
        </StoryShell>
      </div>
    );
  },
};

export const LiveComponent: Story = {};

export const StickyInputBottomCenter: Story = {
  args: {
    inputAlignment: "bottom-center",
  },
};

export const StickyInputBottomStart: Story = {
  args: {
    inputAlignment: "bottom-start",
  },
};

export const StickyInputBottomEnd: Story = {
  args: {
    inputAlignment: "bottom-end",
  },
};

export const NarrowViewportInlineInput: Story = {
  args: {
    stickyInputMinHeightRem: 120,
  },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
};
