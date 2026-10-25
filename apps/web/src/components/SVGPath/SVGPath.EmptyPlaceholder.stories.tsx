"use client";

import { useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { HaikuDto } from "@/api/haikus";
import { Button } from "@/components/StyledComponents";
import { SVGPath, type SVGPathHandle } from "@/components/SVGPath";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import type { CelestialPresetName } from "@/theme/celestialPresets";
import { EXAMPLE_HAIKU_BODY, makeMockHaiku } from "@/storybook";
import { withLoggedInAppLayout } from "@/storybook/decorators/withLoggedInAppLayout";
import styles from "./SVGPath.ScrollToTop.stories.module.css";

const meta = {
  title: "Haiku/SVGPath/EmptyPlaceholder",
  parameters: {
    layout: "fullscreen",
    initialCelestialPreset: "blueNight" satisfies CelestialPresetName,
    nextjs: { appDirectory: true, navigation: { pathname: "/" } },
  },
  decorators: [withLoggedInAppLayout],
} satisfies Meta;

export default meta;
type Story = StoryObj;

/**
 * Same sequence as the main page: a generation starts (path scrolls to the creation slot), the
 * stream ends with draft cleared + haiku prepended in one paint, and the last haiku is removed.
 */
function EmptyPlaceholderDemo({ initialHaikus }: { initialHaikus: HaikuDto[] }): ReactNode {
  const pathRef = useRef<SVGPathHandle>(null);
  const [haikus, setHaikus] = useState(initialHaikus);
  const [draft, setDraft] = useState<GeneratingDraft | null>(null);
  const [runs, setRuns] = useState(0);

  const startGenerating = () => {
    const requestId = `story-generation-${runs}`;
    setRuns(runs + 1);
    setDraft({ requestId, subject: "Spring rain", content: "", createdAtLabel: "" });
    pathRef.current?.scrollToCreationSlot();
  };

  const finishGenerating = () => {
    if (!draft) return;
    flushSync(() => {
      setDraft(null);
      pathRef.current?.snapToTop();
      setHaikus((list) => [makeMockHaiku({ id: draft.requestId, title: draft.subject, body: EXAMPLE_HAIKU_BODY }), ...list]);
    });
  };

  return (
    <div className={styles.stage}>
      <div className={styles.toolbar}>
        <Button type="primary" disabled={Boolean(draft)} onClick={startGenerating}>
          Start generating
        </Button>
        <Button disabled={!draft} onClick={finishGenerating}>
          Save haiku
        </Button>
        <Button disabled={!draft} onClick={() => setDraft(null)}>
          Fail generation
        </Button>
        <Button disabled={haikus.length === 0 || Boolean(draft)} onClick={() => setHaikus([])}>
          Remove all haikus
        </Button>
        <p className={styles.readout}>
          haikus {haikus.length} · {draft ? "generating" : "idle"}
        </p>
      </div>
      <SVGPath
        ref={pathRef}
        haikus={haikus}
        generatingDraft={draft}
        showEmptyPlaceholder
        onHaikuDeleted={(deleted) => setHaikus((list) => list.filter((haiku) => haiku.id !== deleted.id))}
      />
    </div>
  );
}

/** No haikus yet: placeholder lantern parked on the focus stop with its arrow. */
export const NoHaikus: Story = {
  render: () => <EmptyPlaceholderDemo initialHaikus={[]} />,
};

/** One haiku: remove it to watch the placeholder fly back in. */
export const OneHaiku: Story = {
  render: () => (
    <EmptyPlaceholderDemo
      initialHaikus={[makeMockHaiku({ id: "story-only-haiku", title: "Autumn moon", body: EXAMPLE_HAIKU_BODY })]}
    />
  ),
};
