/**
 * Regression: the header set `data-theme={theme}` from React state, which starts
 * as 'dark'. That attribute overrode the correct theme the inline script puts on
 * <html> before paint, so light-theme visitors saw a dark header flash.
 */
import { describe, expect, it, vi } from 'vitest';
import { render } from '@/test/test-utils';
import { LayoutProvider } from '@/contexts/LayoutContext';

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/',
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('@/components/LanguageSelector/LanguageSelector', () => ({ default: () => null }));

import Header from './Header';

function renderHeader(isSticky: boolean) {
  return render(
    <LayoutProvider variant="transparent-V2" isSticky={isSticky}>
      <Header />
    </LayoutProvider>,
  );
}

describe('Header theme', () => {
  it.each([false, true])('never sets data-theme itself (isSticky=%s)', (isSticky) => {
    const { container } = renderHeader(isSticky);
    expect(container.querySelector('header')).not.toHaveAttribute('data-theme');
    expect(container.querySelector('[data-theme]')).toBeNull();
  });

  it('swaps the sticky logo with CSS, so the right one shows on first paint', () => {
    const { container } = renderHeader(true);
    const logos = Array.from(container.querySelectorAll('header img'));
    expect(logos.some((img) => img.className.includes('dark:hidden'))).toBe(true);
    expect(logos.some((img) => img.className.includes('dark:block'))).toBe(true);
  });
});
