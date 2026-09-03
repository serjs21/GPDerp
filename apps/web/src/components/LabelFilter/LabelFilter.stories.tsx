import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { LabelFilter } from "./LabelFilter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const meta: Meta<typeof LabelFilter> = {
  title: "Components/LabelFilter",
  component: LabelFilter,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LabelFilter>;

export const Default: Story = {
  render: (args) => {
    const [selectedIds, setSelectedIds] = useState<string[]>(args.selectedLabelIds || []);
    return (
      <LabelFilter 
        {...args} 
        selectedLabelIds={selectedIds} 
        onChange={(val) => {
          setSelectedIds(val);
          args.onChange?.(val);
        }} 
      />
    );
  },
};
