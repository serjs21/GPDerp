import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { CSSProperties } from "react";
import { ThemeStage } from "@/components/HaikuGenerationStickyNote/storybook/themeStage";
import { HaikuNote } from "./HaikuNote";
import styles from "./HaikuNote.stories.module.css";

const exampleBody = `Shadow questions rise,
a void whispers, "Who are you?"
Self slips through the cracks.

-Jean-Paul Sartickle`;

const autumnBody = `Leaves fall —
Silence gathers on the path,
Winter waits ahead.`;

const meta: Meta<typeof HaikuNote> = {
  title: "Haiku/HaikuNote",
  component: HaikuNote,
  args: {
    body: exampleBody,
  },
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof HaikuNote>;

export const Default: Story = {};

export const WithoutAuthor: Story = {
  args: {
    body: autumnBody,
  },
};

export const WithMetaStrip: Story = {
  args: {
    body: autumnBody,
    author: "Matsuo Bashō",
    meta: "Jan 15",
  },
};

export const SlightRotation: Story = {
  args: {
    body: exampleBody,
    rotate: -2.5,
  },
};

export const Gallery: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className={styles.gallery}>
      <HaikuNote body={exampleBody} rotate={-4} className={styles.galleryNoteA} />
      <HaikuNote body={autumnBody} author="Evening breeze" rotate={1.5} className={styles.galleryNoteB} />
      <HaikuNote
        body={`Stars blink, I wonder—\nAm I just dust in the void,\nOr meaning's whisper?`}
        meta="2:30 PM"
        rotate={-1}
        className={styles.galleryNoteC}
      />
    </div>
  ),
};

export const ThemeNightSky: Story = {
  render: (args) => (
    <ThemeStage theme="night-sky">
      <HaikuNote {...args} />
    </ThemeStage>
  ),
};

export const ThemeTokyoDusk: Story = {
  render: (args) => (
    <ThemeStage theme="tokyo-dusk">
      <HaikuNote {...args} />
    </ThemeStage>
  ),
};

export const ThemeSumie: Story = {
  render: (args) => (
    <ThemeStage theme="sumie">
      <div style={{ padding: "2rem" } as CSSProperties}>
        <HaikuNote {...args} />
      </div>
    </ThemeStage>
  ),
};
