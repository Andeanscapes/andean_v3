import type { Meta, StoryObj, StoryContext } from '@storybook/react'
import React, { useEffect, useRef, useState } from 'react'
import Header from './Header'
import { StorybookProviders } from '../../../.storybook/decorators'

// Decorator to provide realistic scrollable layout with proper context
const HeaderDecorator = (Story: React.ComponentType, context: StoryContext) => {
  // Priority: story globals > story parameters > context globals > default
  const theme = (context.args?.theme || context.parameters.theme || context.globals.theme || 'light') as 'light' | 'dark'
  const variant = context.parameters.variant || 'transparent-V2'
  const containerRef = useRef<HTMLDivElement>(null)
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const shouldBeSticky = container.scrollTop > 50
      setIsSticky(shouldBeSticky)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <StorybookProviders theme={theme} variant={variant} isSticky={isSticky}>
      <div 
        ref={containerRef}
        style={{
          height: '100vh',
          overflow: 'auto',
          overscrollBehavior: 'none',
          position: 'relative'
        }}
      >
        <Story />

        {/* Hero Section - starts from top, header overlays it */}
        <div 
          style={{ 
            minHeight: '100vh', 
            background: theme === 'dark' 
              ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold'
          }}
        >
          Hero Section - Scroll down to see sticky header
        </div>

        {/* Content sections */}
        <div style={{ 
          background: theme === 'dark' ? '#0f172a' : '#ffffff'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={i} 
                style={{ 
                  marginBottom: '2rem', 
                  padding: '1.5rem', 
                  backgroundColor: theme === 'dark' ? '#1e293b' : '#f3f4f6',
                  borderRadius: '6px',
                  border: `1px solid ${theme === 'dark' ? '#334155' : '#e5e7eb'}`
                }}
              >
                <h3 style={{ 
                  fontSize: '1.125rem', 
                  marginBottom: '0.75rem',
                  color: theme === 'dark' ? '#ffffff' : '#000000'
                }}>
                  Section {i + 1}
                </h3>
                <p style={{ color: theme === 'dark' ? '#cbd5e1' : '#6b7280', fontSize: '0.9rem' }}>
                  Scroll to see the header transform. Notice how it adapts automatically for readability.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StorybookProviders>
  )
}

const meta = {
  title: 'Components/Header',
  component: Header,
  tags: ['autodocs'],
  decorators: [HeaderDecorator],
  parameters: {
    layout: 'fullscreen',
    variant: 'transparent-V2',
    isSticky: false,
    docs: {
      description: {
        component: 'Modern accessible header with glassmorphism, theme toggle, language selector, and mobile menu. Scroll down to see the sticky effect with glassmorphism backdrop.'
      }
    }
  }
} satisfies Meta<typeof Header>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Light theme - transparent header with scroll sticky effect
 */
export const LightTheme: Story = {
  parameters: {
    theme: 'light',
    variant: 'transparent-V2',
    backgrounds: { default: 'light' },
    docs: {
      description: {
        story: 'Light theme with transparent header. Scroll down to see the sticky behavior with glassmorphism effect.'
      }
    }
  },
  globals: {
    theme: 'light'
  }
}

/**
 * Dark theme - transparent header with scroll sticky effect
 */
export const DarkTheme: Story = {
  parameters: {
    theme: 'dark',
    variant: 'transparent',
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Dark theme with transparent header. Scroll down to see the sticky behavior with glassmorphism effect.'
      }
    }
  },
  globals: {
    theme: 'dark'
  }
}
