import {cleanup, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {afterEach, describe, expect, it, vi} from 'vitest'

import {Button} from './Button'

describe('Button', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders children text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', {name: 'Click me'})).toBeInTheDocument()
  })

  it('applies primary variant classes by default', () => {
    render(<Button>Primary</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('btn')
    expect(btn.className).toContain('btn-primary')
    expect(btn.className).toContain('btn-md')
  })

  it('applies the correct variant class', () => {
    const {rerender} = render(<Button variant="secondary">Btn</Button>)
    expect(screen.getByRole('button').className).toContain('btn-secondary')

    rerender(<Button variant="ghost">Btn</Button>)
    expect(screen.getByRole('button').className).toContain('btn-ghost')

    rerender(<Button variant="outline">Btn</Button>)
    expect(screen.getByRole('button').className).toContain('btn-outline')
  })

  it('applies the correct size class', () => {
    const {rerender} = render(<Button size="sm">Btn</Button>)
    expect(screen.getByRole('button').className).toContain('btn-sm')

    rerender(<Button size="lg">Btn</Button>)
    expect(screen.getByRole('button').className).toContain('btn-lg')
  })

  it('applies full width class when fullWidth is true', () => {
    render(<Button fullWidth>Wide</Button>)
    expect(screen.getByRole('button').className).toContain('w-full')
  })

  it('does not apply full width class by default', () => {
    render(<Button>Normal</Button>)
    expect(screen.getByRole('button').className).not.toContain('w-full')
  })

  it('applies loading class and disables button when loading', () => {
    render(<Button loading>Loading</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('loading')
    expect(btn).toBeDisabled()
  })

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('is not disabled by default', () => {
    render(<Button>Enabled</Button>)
    expect(screen.getByRole('button')).not.toBeDisabled()
  })

  it('calls onClick handler when clicked', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click</Button>)
    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button disabled onClick={handleClick}>Click</Button>)
    await user.click(screen.getByRole('button'))

    expect(handleClick).not.toHaveBeenCalled()
  })

  it('merges custom className', () => {
    render(<Button className="custom-class">Btn</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('custom-class')
    expect(btn.className).toContain('btn')
  })

  it('passes through additional HTML attributes', () => {
    render(<Button data-testid="my-btn" type="submit">Submit</Button>)
    const btn = screen.getByTestId('my-btn')
    expect(btn).toHaveAttribute('type', 'submit')
  })
})
