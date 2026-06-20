import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRef, useState } from "react";
import type { HaikuDto } from "@/api/haikus";
import { SavedHaikusListView } from "@/components/SavedHaikusList/SavedHaikusList";
import { HaikuGenerationStickyNote } from "./HaikuGenerationStickyNote";
import { HaikuGenerationStickyNoteInitial } from "./HaikuGenerationStickyNoteInitial/HaikuGenerationStickyNoteInitial";
import { HaikuGenerationStickyNoteInput } from "./HaikuGenerationStickyNoteInput/HaikuGenerationStickyNoteInput";
import { HaikuGenerationStickyNoteCard } from "./HaikuGenerationStickyNoteCard/HaikuGenerationStickyNoteCard";
import styles from "./HaikuGenerationStickyNote.module.css";

const meta: Meta<typeof HaikuGenerationStickyNote> = {
  title: "Haiku/HaikuGenerationStickyNote",
  component: HaikuGenerationStickyNote,
  decorators: [
    (Story) => {
      const qc = new QueryClient();
      return (
        <QueryClientProvider client={qc}>
          <Story />
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

export const InitialOnly: Story = {
  render: function InitialOnlyStory() {
    const [subject, setSubject] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    return (
      <div className={styles.wrapper}>
        <div className={styles.inputSection}>
          <HaikuGenerationStickyNoteInput
            subject={subject}
            onSubjectChange={setSubject}
            onSubmit={(e) => e.preventDefault()}
          />
        </div>
        <div ref={scrollRef} className={styles.scrollArea}>
          <HaikuGenerationStickyNoteInitial />
        </div>
      </div>
    );
  },
};

export const FirstGeneration: Story = {
  render: function FirstGenerationStory() {
    const [subject, setSubject] = useState("Morning mist");
    const scrollRef = useRef<HTMLDivElement>(null);

    return (
      <div className={styles.wrapper}>
        <div className={styles.inputSection}>
          <HaikuGenerationStickyNoteInput
            subject={subject}
            onSubjectChange={setSubject}
            onSubmit={(e) => e.preventDefault()}
            isLoading
          />
        </div>
        <div ref={scrollRef} className={styles.scrollArea}>
          <HaikuGenerationStickyNoteInitial washingOut />
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
        <div className={styles.inputSection}>
          <HaikuGenerationStickyNoteInput
            subject={subject}
            onSubjectChange={setSubject}
            onSubmit={(e) => e.preventDefault()}
          />
        </div>
        <div ref={scrollRef} className={styles.scrollArea}>
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
          />
        </div>
      </div>
    );
  },
};

export const LiveComponent: Story = {};
