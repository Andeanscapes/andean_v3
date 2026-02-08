import type { Preview } from '@storybook/react'
import '../src/styles/globals.css'
import { withMockProviders } from './decorators'

const preview: Preview = {
  decorators: [withMockProviders],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    layout: 'fullscreen',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0f172a' },
        { name: 'gradient-hero', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { name: 'gradient-pink', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }
      ]
    }
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
}

export default preview
