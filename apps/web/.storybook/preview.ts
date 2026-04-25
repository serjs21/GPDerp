import type { Preview } from '@storybook/nextjs-vite'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { createElement } from 'react';
import '@/theme/globals.css';
import '@/theme/themes/tokyo-dusk.css';
import '@/theme/themes/sumie.css';
import '@/theme/themes/night-sky.css';
import '@/theme/antd-overrides.css';

const preview: Preview = {
  decorators: [
    (Story) =>
      createElement(
        GoogleOAuthProvider,
        { clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'storybook-google-client-id' },
        createElement(
          'div',
          {
            style: {
              minHeight: '100vh',
              padding: '1rem',
              background: 'var(--background)',
              color: 'var(--text-color)',
              transition: 'background 160ms ease, color 160ms ease',
            },
          },
          createElement(Story),
        ),
      ),
  ],
  parameters: {
    backgrounds: {
      default: 'theme-bg',
      values: [
        { name: 'theme-bg', value: 'var(--background)' },
      ],
    },
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