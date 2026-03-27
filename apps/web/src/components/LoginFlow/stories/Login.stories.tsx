import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { fn } from 'storybook/test';
import { PasswordLoginForm } from '../PasswordLogin';


const meta = {
  title: 'LoginFlow/PasswordLogin',
  component: PasswordLoginForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    backgroundColor: { control: 'color' },
},
  args: { onClick: fn() },
} satisfies Meta<typeof PasswordLoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    primary: true,
    label: 'Form',
  },
};
