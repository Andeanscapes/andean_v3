import { mergeConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/postcss'
import type { StorybookConfig } from '@storybook/react-vite'
import { fileURLToPath } from 'node:url'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.tsx'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-docs'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },
  staticDirs: ['../public'],
  viteFinal: async (config) => {
    return mergeConfig(config, {
      plugins: [react()],
      resolve: {
        alias: {
          '@': fileURLToPath(new URL('../src', import.meta.url))
        }
      },
      css: {
        postcss: {
          plugins: [
            tailwindcss
          ]
        }
      }
    });
  }
}

export default config
