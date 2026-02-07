import path from 'path'
import { mergeConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/postcss'
import type { StorybookConfig } from '@storybook/react-vite'

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
  docs: {
    autodocs: 'tag'
  },
  staticDirs: ['../public'],
  viteFinal: async (config) => {
    return mergeConfig(config, {
      plugins: [react()],
      esbuild: {
        jsx: 'automatic'
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '../src')
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
