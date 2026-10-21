import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LabelsFilterModal } from "@/components/LabelsFilterModal/LabelsFilterModal";
import {
  labelsPagedRoute,
  labelsRoute,
  pendingLabelsPagedRoute,
  pendingLabelsRoute,
  scrollToEnd,
  STORY_ACCOUNT_ID,
  STORY_LABELS,
  withMockApi,
  withQueryClient,
} from "@/storybook";

/** ComicLabelPickerPanel (LabelPickerResults) inside the header's labels filter modal. */
const meta = {
  title: "SakuraLoaderPlacesReview/Label picker",
  component: LabelsFilterModal,
  decorators: [withQueryClient],
  parameters: { layout: "fullscreen" },
  args: {
    open: true,
    accountId: STORY_ACCOUNT_ID,
    includeIds: [],
    excludeIds: [],
    onApply: () => undefined,
    onClose: () => undefined,
  },
} satisfies Meta<typeof LabelsFilterModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** LabelPickerResults: first-page loader. */
export const ListLoading: Story = {
  decorators: [withMockApi([pendingLabelsPagedRoute(), pendingLabelsRoute()])],
};

/** LabelPickerResults: next-page loader under the grid (the play function scrolls the list to its end). */
export const NextPageLoading: Story = {
  decorators: [
    withMockApi([labelsPagedRoute(STORY_LABELS, { total: 36, pendingAfterFirstPage: true }), labelsRoute(STORY_LABELS)]),
  ],
  play: () => scrollToEnd('[class*="listScroll"]'),
};
