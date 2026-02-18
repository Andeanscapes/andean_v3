import { render, screen } from '@/test/test-utils';
import { describe, expect, it } from 'vitest';
import { IncludesAccordion } from './IncludesAccordion';
import { MOCK_TRANSLATED_CONFIG } from '@/test/test-utils';

describe('IncludesAccordion', () => {
  it('renders accordion title', () => {
    render(<IncludesAccordion config={MOCK_TRANSLATED_CONFIG} />);
    expect(screen.getByText('¿Qué incluye?')).toBeInTheDocument();
  });

  it('renders all includes items from config', () => {
    render(<IncludesAccordion config={MOCK_TRANSLATED_CONFIG} />);
    MOCK_TRANSLATED_CONFIG.includesItems.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  it('has details button', () => {
    render(<IncludesAccordion config={MOCK_TRANSLATED_CONFIG} />);
    expect(screen.getByText('Ver detalles completos')).toBeInTheDocument();
  });
});
