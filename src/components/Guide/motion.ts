import type { CSSProperties } from 'react';

/**
 * Position in a staggered sequence for `GuideMotion.module.css`. Time-based
 * animation waits `step × 0.1s`; scroll-driven animation (where `animation-delay`
 * is ignored) shifts its range by `step × 2%` instead, so the order survives.
 */
export function staggerStyle(step: number): CSSProperties {
  return { '--stagger': step } as CSSProperties;
}
