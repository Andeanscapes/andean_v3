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
      define: {
        'process.env': {},
        // eslint-disable-next-line no-undef
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '../src'),
          // Mock Next.js modules for Storybook
          'next/navigation': path.resolve(__dirname, './mocks.ts'),
          'next-intl': path.resolve(__dirname, './mocks.ts'),
          'next/image': path.resolve(__dirname, './mocks.ts'),
          'next/link': path.resolve(__dirname, './mocks.ts'),
          '@/contexts/ThemeContext': path.resolve(__dirname, './decorators.tsx'),
          '@/contexts/LanguageContext': path.resolve(__dirname, './decorators.tsx'),
          '@/contexts/LayoutContext': path.resolve(__dirname, './decorators.tsx'),
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
