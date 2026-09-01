import { memo } from 'react';
import { ImageIcon } from 'lucide-react';
import { getResponsiveImageSrc } from '@/utils/responsiveImage';

type ExperienceCardImageProps = {
  src: string;
  alt: string;
  sizes?: string;
};

/**
 * Card image for the experiences list.
 *
 * Deliberately **not** `next/image`. On the deployed Worker `/_next/image` is a
 * pass-through — verified with `npm run preview`, which returns the untouched
 * 716x955 original for every width from `w=64` to `w=3840`. Routing through it
 * therefore buys no resizing, costs a subrequest, and silently served mobile
 * clients the full-size file.
 *
 * `<picture>` with a pre-generated `-mobile` variant is what the hero components
 * already do, and it is the only mechanism that actually reduces mobile bytes
 * here. See `docs/V2_REMOTE_RESOURCES_MIGRATION.md` — every `<picture>`-rendered
 * media path requires an uploaded `-mobile` sibling.
 *
 * There is no `onLoad`-gated reveal: an earlier version faded the image in from a
 * React `load` handler, which loses the race whenever the browser finishes
 * loading before hydration and left the card showing an empty placeholder over a
 * fully loaded image.
 */
function ExperienceCardImage({ src, alt, sizes }: ExperienceCardImageProps) {
  const { mobile } = getResponsiveImageSrc(src);

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-xl bg-base-200">
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center text-base-content/35"
      >
        <ImageIcon className="h-8 w-8" />
      </div>
      <picture>
        <source media="(max-width: 767px)" srcSet={mobile} />
        <img
          src={src}
          alt={alt}
          // Empty alt marks the image decorative, which is only correct when the
          // caller renders the same text adjacently — hide it from the
          // accessibility tree so it is skipped, not announced as an image.
          aria-hidden={alt === '' ? 'true' : undefined}
          sizes={sizes}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>
    </div>
  );
}

export default memo(ExperienceCardImage);
