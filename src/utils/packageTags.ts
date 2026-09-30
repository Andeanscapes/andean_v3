import { PACKAGE_TAG_I18N } from '@/i18n/mappings/experience';
import type { PackageTagContent } from '@/lib/schemas/experience.schema';
import type { PackageTagCode } from '@/lib/schemas/feed/v2';

type Translator = (key: string) => string;

/**
 * Translate feed package-tag codes into renderable badges. Shared by the list,
 * landing and experience services so every surface shows the same copy and
 * colour for the same fact.
 */
export function toPackageTags(
  codes: readonly PackageTagCode[] | undefined,
  t: Translator,
): PackageTagContent[] {
  return (codes ?? []).map((code) => ({
    label: t(PACKAGE_TAG_I18N[code].label),
    variant: PACKAGE_TAG_I18N[code].variant,
  }));
}
