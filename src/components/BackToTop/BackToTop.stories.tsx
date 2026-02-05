import type { Meta, StoryObj } from '@storybook/react'
import BackToTop from './BackToTop'

const meta = {
  title: 'Components/BackToTop',
  component: BackToTop,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof BackToTop>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-6 py-10 space-y-4">
        <h1 className="text-3xl font-semibold text-gray-900">BackToTop</h1>
        <p className="text-gray-700">
          Scroll down until you reach the footer area, then click the button to test{' '}
          <code className="font-mono">window.scrollTo</code>.
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-6 pb-16">
        <div className="space-y-6">
          {Array.from({length: 14}).map((_, i) => (
            <section key={i} className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <h2 className="text-xl font-semibold text-gray-900">Section {i + 1}</h2>
              <p className="mt-2 text-gray-600">Spacer content…</p>
              <div className="h-24" />
            </section>
          ))}
        </div>

        <div className="mt-16 rounded-lg overflow-hidden border border-gray-200">
          <div className="bg-gray-900 px-6 py-10 text-white">
            <h3 className="text-2xl font-semibold">Footer area</h3>
            <p className="mt-2 text-gray-300">The BackToTop button is positioned on the top edge.</p>
          </div>

          <div className="relative flex justify-center bg-gray-950 py-7">
            <BackToTop />
          </div>
        </div>
      </div>
    </div>
  )
}
