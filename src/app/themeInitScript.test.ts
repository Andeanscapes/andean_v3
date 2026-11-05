/**
 * The inline theme script runs before React. These tests execute the exact
 * string that ships in <head>.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { THEME_INIT_SCRIPT } from './themeInitScript';

function run(prefersDark: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: prefersDark && query.includes('dark') }));
  new Function(THEME_INIT_SCRIPT)();
}

describe('THEME_INIT_SCRIPT', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });
  afterEach(() => vi.unstubAllGlobals());

  it('applies the saved theme over the OS preference', () => {
    localStorage.setItem('theme', 'light');
    run(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it.each([
    [true, 'dark'],
    [false, 'light'],
  ])('falls back to the OS preference (prefersDark=%s)', (prefersDark, expected) => {
    run(prefersDark);
    expect(document.documentElement.getAttribute('data-theme')).toBe(expected);
  });

  it('ignores an invalid saved value', () => {
    localStorage.setItem('theme', 'neon');
    run(false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
