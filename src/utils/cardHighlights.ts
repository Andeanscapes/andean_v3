import type { HighlightCode } from '@/lib/schemas/feed/v2';

/**
 * Highlight promoted from the chip row to a photo badge beside the mine and
 * plan badges: a private tour changes what is being bought, so it must not
 * read as one more amenity chip.
 */
const PRIVATE_TOUR: HighlightCode = 'privateTour';

/**
 * Split feed highlight codes into the promoted private-tour flag and the codes
 * that stay chips. Shared by the list and landing cards so both surfaces
 * promote the same fact and never render it twice.
 */
export function splitCardHighlights(codes: readonly HighlightCode[] | undefined): {
  isPrivateTour: boolean;
  chipCodes: HighlightCode[];
} {
  const all = codes ?? [];
  return {
    isPrivateTour: all.includes(PRIVATE_TOUR),
    chipCodes: all.filter((code) => code !== PRIVATE_TOUR),
  };
}
