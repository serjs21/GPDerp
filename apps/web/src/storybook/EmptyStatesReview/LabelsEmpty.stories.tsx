import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import ManageLabelsPage from "@/app/manage_labels/page";
import { LabelsFilterModal } from "@/components/LabelsFilterModal/LabelsFilterModal";
import {
  labelsPagedRoute,
  labelsRoute,
  manageLabelsAccountRoute,
  SettingsStoryPage,
  STORY_ACCOUNT_ID,
  withLoggedInAppLayout,
  withMockApi,
} from "@/storybook";

const NO_LABELS = withMockApi([manageLabelsAccountRoute, labelsPagedRoute([]), labelsRoute([])]);

/** Every labels list with an account that has no labels (or none matching the search). */
const meta = {
  title: "EmptyStatesReview/Labels",
  decorators: [withLoggedInAppLayout],
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Settings › Labels (ManageLabelsList): no labels yet. */
export const SettingsNoLabels: Story = {
  decorators: [NO_LABELS],
  parameters: { nextjs: { appDirectory: true, navigation: { pathname: "/settings", query: { tab: "labels" } } } },
  render: () => <SettingsStoryPage tab="labels" />,
};

/** Settings › Labels (ManageLabelsList): a header search with no matches ("no results" copy). */
export const SettingsNoSearchResults: Story = {
  decorators: [NO_LABELS],
  parameters: {
    nextjs: { appDirectory: true, navigation: { pathname: "/settings", query: { tab: "labels", search: "tempest" } } },
  },
  render: () => <SettingsStoryPage tab="labels" searchQuery="tempest" />,
};

/** /manage_labels page (ManageLabelsList): no labels yet. */
export const ManageLabelsPageNoLabels: Story = {
  decorators: [NO_LABELS],
  parameters: { nextjs: { appDirectory: true, navigation: { pathname: "/manage_labels" } } },
  render: () => <ManageLabelsPage />,
};

/** Header labels filter (ComicLabelPickerPanel › LabelPickerResults): nothing to pick. */
export const LabelPickerNoLabels: Story = {
  decorators: [NO_LABELS],
  render: () => (
    <LabelsFilterModal
      open
      accountId={STORY_ACCOUNT_ID}
      includeIds={[]}
      excludeIds={[]}
      onApply={() => undefined}
      onClose={() => undefined}
    />
  ),
};
