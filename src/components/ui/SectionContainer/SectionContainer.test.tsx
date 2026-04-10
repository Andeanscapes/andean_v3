import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SectionContainer } from './SectionContainer';

describe('SectionContainer', () => {
  it('renders default section with max width container', () => {
    const { container } = render(
      <SectionContainer>
        <div>Inner</div>
      </SectionContainer>
    );

    const section = container.querySelector('section');
    const inner = container.querySelector('div.mx-auto.max-w-screen-2xl');

    expect(section).toBeInTheDocument();
    expect(inner).toBeInTheDocument();
  });

  it('supports polymorphic root element', () => {
    const { container } = render(
      <SectionContainer as="div" sectionClassName="test-root">
        <div>Inner</div>
      </SectionContainer>
    );

    const root = container.querySelector('div.test-root');
    expect(root).toBeInTheDocument();
  });
});
