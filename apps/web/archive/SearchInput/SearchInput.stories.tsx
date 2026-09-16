import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { SearchInput } from "./SearchInput";

const meta: Meta<typeof SearchInput> = {
  title: "Components/SearchInput",
  component: SearchInput,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value || "");
    return (
      <SearchInput 
        {...args} 
        value={value} 
        onChange={(val) => {
          setValue(val);
          args.onChange?.(val);
        }} 
      />
    );
  },
};
