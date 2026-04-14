import type { Preview } from '@storybook/nextjs-vite'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { createElement } from 'react';

const preview: Preview = {
  decorators: [
    (Story) =>
      createElement(
        GoogleOAuthProvider,
        { clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'storybook-google-client-id' },
        createElement(Story),
      ),
  ],
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;