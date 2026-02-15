import type { Preview, Decorator } from '@storybook/react'
import React from 'react'
import '../src/styles/globals.css'

const withTheme: Decorator = (Story) => {
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);
  return React.createElement('div', { 
    'data-theme': 'light',
    style: { minHeight: '100vh', padding: '2rem', backgroundColor: '#ffffff' }
  }, React.createElement(Story));
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    layout: 'fullscreen'
  },
  decorators: [withTheme]
}

export default preview
