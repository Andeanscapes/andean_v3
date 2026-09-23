/** Selects one feed-declared hero image without changing the UI data shape. */
export function pickHeroVariant(
  variants: readonly string[],
  fallback: string,
  random: () => number = Math.random,
): string {
  if (variants.length === 0) return fallback;

  const index = Math.min(variants.length - 1, Math.floor(random() * variants.length));
  return variants[index];
}
