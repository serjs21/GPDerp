import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRef, useState } from "react";
import type { HaikuDto } from "@/api/haikus";
import { SavedHaikusListView } from "@/components/SavedHaikusList/SavedHaikusList";
import { HaikuGenerationStickyNote } from "./HaikuGenerationStickyNote";
import { HaikuGenerationStickyNoteInitial } from "./HaikuGenerationStickyNoteInitial/HaikuGenerationStickyNoteInitial";
import { HaikuGenerationStickyNoteInput } from "./HaikuGenerationStickyNoteInput/HaikuGenerationStickyNoteInput";
import { HaikuGenerationStickyNoteCard } from "./HaikuGenerationStickyNoteCard/HaikuGenerationStickyNoteCard";
import { haikuGenerationStickyNoteListStyles } from "./HaikuGenerationStickyNoteList/HaikuGenerationStickyNoteList";
import styles from "./HaikuGenerationStickyNote.module.css";

const meta: Meta<typeof HaikuGenerationStickyNote> = {
  title: "Haiku/HaikuGenerationStickyNote",
  component: HaikuGenerationStickyNote,
  decorators: [
    (Story) => {
      const qc = new QueryClient();
      return (
        <QueryClientProvider client={qc}>
          <div style={{ minHeight: "100dvh", width: "100%" }}>
            <Story />
          </div>
        </QueryClientProvider>
      );
    },
  ],
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
    const [subject, setSubject] = useState("");

    return (
      <div className={styles.wrapper}>
        <div className={styles.displayArea}>
          <HaikuGenerationStickyNoteInitial />
        </div>
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

export const FirstGeneration: Story = {
  render: function FirstGenerationStory() {
    const [subject, setSubject] = useState("Morning mist");

    return (
      <div className={styles.wrapper}>
        <div className={styles.displayArea}>
          <div
            className={haikuGenerationStickyNoteListStyles.scrollArea}
            style={
              {
                "--haiku-grid-columns": 1,
                "--haiku-card-width": "28rem",
                "--haiku-grid-gap": "3rem",
              } as React.CSSProperties
            }
          >
            <div className={haikuGenerationStickyNoteListStyles.haikuGrid}>
              <HaikuGenerationStickyNoteCard
                generatingDraft={{
                  requestId: "demo-1",
                  subject: "Morning mist",
                  content: "Dew on the grass —\n",
                  createdAtLabel: "9:00 AM",
                }}
              />
            </div>
          </div>
          <HaikuGenerationStickyNoteInitial />
        </div>
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

function makeMockHaiku(partial: Partial<HaikuDto> & Pick<HaikuDto, "id" | "body">): HaikuDto {
  return {
    title: "Mock subject",
    titleSuffix: 0,
    createdAt: new Date("2026-01-15T12:00:00.000Z").toISOString(),
    accountId: "00000000-0000-4000-8000-000000000001",
    createdById: "00000000-0000-4000-8000-000000000002",
    labels: [],
    ...partial,
  };
}

export const LoggedInWithList: Story = {
  render: function LoggedInWithListStory() {
    const [subject, setSubject] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const haikus = [
      makeMockHaiku({
        id: "h1",
        title: "Jean-Paul Sartickle",
        body: "Shadow questions rise,\na void whispers, \"Who are you?\"\nSelf slips through the cracks.",
        labels: [{ id: "l1", name: "philosophy", color: "blue" }],
      }),
    ];

    return (
      <div className={styles.wrapper}>
        <div ref={scrollRef} className={styles.displayArea}>
          <div
            className={haikuGenerationStickyNoteListStyles.scrollArea}
            style={
              {
                "--haiku-grid-columns": 1,
                "--haiku-card-width": "28rem",
                "--haiku-grid-gap": "3rem",
              } as React.CSSProperties
            }
          >
            <SavedHaikusListView
              haikus={haikus}
              isInitialLoading={false}
              isFetchingNextPage={false}
              isError={false}
              hasNextPage={false}
              onLoadMore={() => undefined}
              onRetry={() => undefined}
              scrollRootRef={scrollRef}
              HaikuCardComponent={HaikuGenerationStickyNoteCard}
              showEmptyMessage={false}
              embedded
              embeddedListClassName={haikuGenerationStickyNoteListStyles.haikuGrid}
            />
          </div>
        </div>
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

export const LoggedInWithExistingHaikus: Story = {
  ...LoggedInWithList,
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

export const WideGridThreeColumns: Story = {
  render: function WideGridThreeColumnsStory() {
    const [subject, setSubject] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const haikus = [
      makeMockHaiku({ id: "h1", title: "One", body: "First haiku line\nSecond line\nThird line" }),
      makeMockHaiku({ id: "h2", title: "Two", body: "Another haiku\nMiddle line\nLast line" }),
      makeMockHaiku({ id: "h3", title: "Three", body: "Third card\nIn the grid\nFor demo" }),
    ];

    return (
      <div className={styles.wrapper} style={{ minWidth: 1400 }}>
        <div ref={scrollRef} className={styles.displayArea}>
          <div
            className={haikuGenerationStickyNoteListStyles.scrollArea}
            style={
              {
                "--haiku-grid-columns": 3,
                "--haiku-card-width": "28rem",
                "--haiku-grid-gap": "3rem",
              } as React.CSSProperties
            }
          >
            <SavedHaikusListView
              haikus={haikus}
              isInitialLoading={false}
              isFetchingNextPage={false}
              isError={false}
              hasNextPage={false}
              onLoadMore={() => undefined}
              onRetry={() => undefined}
              scrollRootRef={scrollRef}
              HaikuCardComponent={HaikuGenerationStickyNoteCard}
              showEmptyMessage={false}
              embedded
              embeddedListClassName={haikuGenerationStickyNoteListStyles.haikuGrid}
            />
          </div>
        </div>
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
