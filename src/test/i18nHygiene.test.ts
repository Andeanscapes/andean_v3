/**
 * Locale-bundle hygiene.
 *
 * Copy is bundled at build time (`src/i18n/request.ts` static-imports the message
 * files), so every unused key ships to the browser. Deleting a component without
 * pruning its namespace leaves copy that is paid for on every page load and that
 * a future reader cannot distinguish from live copy.
 *
 * This branch removed six unreachable components and their namespaces; these
 * assertions are what stops the next deletion from silently re-accumulating the
 * same debt.
 *
 * Scope note: the guard covers **top-level namespaces**, not individual keys.
 * Per-key coverage would flag the many keys resolved through the typed mapping
 * tables in `src/i18n/mappings/*`, which are referenced by table entry rather
 * than by a literal `t('…')` call.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import enMessages from '@/i18n/messages/en.json';
import esMessages from '@/i18n/messages/es.json';
import frMessages from '@/i18n/messages/fr.json';
import { EXPERIENCE_I18N, EXPERIENCE_METADATA_NAMESPACE } from '@/i18n/mappings/experience';

const SRC_ROOT = path.resolve(__dirname, '..');
const LOCALES = { en: enMessages, es: esMessages, fr: frMessages } as const;

/**
 * Namespaces with no `t('Namespace.…')` or `useTranslations('Namespace')` call
 * anywhere in source, kept deliberately.
 *
 * These predate this branch. They are listed rather than deleted because removing
 * copy for a feature someone may still intend to ship is a product decision, not
 * a cleanup — and an explicit list makes the debt visible instead of implied.
 */
const KNOWN_UNUSED_NAMESPACES = ['Home'];

/**
 * Experience page metadata resolves its namespace at runtime from
 * `EXPERIENCE_METADATA_NAMESPACE`, so no literal call names it. Those namespaces
 * are live; treating them as referenced keeps the allowlist for genuinely dead copy.
 */
const MAPPED_NAMESPACES: ReadonlySet<string> = new Set(Object.values(EXPERIENCE_METADATA_NAMESPACE));

function sourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);

    // The message bundles themselves would match every namespace they define.
    if (full.includes(path.join('i18n', 'messages'))) continue;

    if (statSync(full).isDirectory()) {
      sourceFiles(full, acc);
      continue;
    }
    if (/\.(ts|tsx|js|jsx)$/.test(entry)) acc.push(full);
  }
  return acc;
}

const SOURCE_BLOB = sourceFiles(SRC_ROOT)
  .map((file) => readFileSync(file, 'utf8'))
  .join('\n');

function isNamespaceReferenced(namespace: string): boolean {
  if (MAPPED_NAMESPACES.has(namespace)) return true;
  // Matches `useTranslations('Ns')`, `getTranslations('Ns')` and `t('Ns.key')`.
  return new RegExp(`(useTranslations|getTranslations)\\(['"\`]${namespace}['"\`]`).test(
    SOURCE_BLOB,
  ) || new RegExp(`['"\`]${namespace}\\.[A-Za-z0-9_]`).test(SOURCE_BLOB);
}

describe('locale bundles', () => {
  /**
   * Parity is asserted on the key *paths*, not just the count. Two bundles can
   * hold the same number of keys while disagreeing on which ones, which renders
   * a raw key in one locale only — the failure this is here to prevent.
   */
  it('keeps en, es and fr structurally identical', () => {
    const paths = (value: unknown, prefix = ''): string[] => {
      if (value === null || typeof value !== 'object' || Array.isArray(value)) return [prefix];
      return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
        paths(child, prefix ? `${prefix}.${key}` : key),
      );
    };

    const en = paths(LOCALES.en).sort();

    for (const locale of ['es', 'fr'] as const) {
      const other = paths(LOCALES[locale]).sort();

      expect(
        other,
        `${locale}.json key paths differ from en.json — a missing key renders as a raw key`,
      ).toEqual(en);
    }
  });

  it('ships no namespace that source never reads', () => {
    const orphans = Object.keys(LOCALES.en)
      .filter((namespace) => !KNOWN_UNUSED_NAMESPACES.includes(namespace))
      .filter((namespace) => !isNamespaceReferenced(namespace));

    expect(
      orphans,
      'these namespaces are dead copy shipped to every client — prune them, or add ' +
        'them to KNOWN_UNUSED_NAMESPACES with a reason',
    ).toEqual([]);
  });

  /**
   * Guards the list itself. Once a namespace acquires a real consumer it must
   * leave the allowlist, otherwise the allowlist becomes a place where genuinely
   * dead copy can hide behind a stale entry.
   */
  it('keeps the unused-namespace allowlist free of stale entries', () => {
    for (const namespace of KNOWN_UNUSED_NAMESPACES) {
      expect(
        Object.keys(LOCALES.en),
        `"${namespace}" is allowlisted as unused but no longer exists in en.json`,
      ).toContain(namespace);

      expect(
        isNamespaceReferenced(namespace),
        `"${namespace}" now has a consumer — remove it from KNOWN_UNUSED_NAMESPACES`,
      ).toBe(false);
    }
  });

  /**
   * Per-experience itinerary copy is reached only through `EXPERIENCE_I18N`, so
   * the namespace-level scan above cannot see a key that no mapping points at.
   * Both experiences once shipped a full unused itinerary to every client.
   */
  it('ships no per-experience itinerary copy the mapping does not use', () => {
    const mapped = new Set<string>();
    const collect = (node: unknown): void => {
      if (typeof node === 'string') mapped.add(node);
      else if (node && typeof node === 'object') Object.values(node).forEach(collect);
    };
    collect(EXPERIENCE_I18N);

    const experiences = LOCALES.en.experiences as Record<string, { itinerary?: Record<string, unknown> }>;
    const unused = Object.keys(EXPERIENCE_I18N).flatMap((id) =>
      Object.keys(experiences[id]?.itinerary ?? {})
        .map((key) => `experiences.${id}.itinerary.${key}`)
        .filter((key) => !mapped.has(key)),
    );

    expect(unused, 'unused itinerary keys — delete them or map them').toEqual([]);
  });

  it('resolves every hero value point in en, es and fr', () => {
    const resolve = (messages: unknown, key: string): unknown =>
      key.split('.').reduce<unknown>(
        (node, part) => (node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined),
        messages,
      );

    for (const [id, mapping] of Object.entries(EXPERIENCE_I18N)) {
      for (const [locale, messages] of Object.entries(LOCALES)) {
        const missing = mapping.valueStack.filter((key) => typeof resolve(messages, key) !== 'string');
        expect(missing, `${id} value points missing in ${locale}`).toEqual([]);
      }
    }
  });

  /** Prime is Core plus extras; a shorter Prime list read as the lesser option. */
  it('lists every Core value point on Prime, then its extras', () => {
    const core = EXPERIENCE_I18N.chivorEmeraldCore.valueStack;
    const prime = EXPERIENCE_I18N.chivorEmeraldPrime.valueStack;

    expect(prime.slice(0, core.length)).toEqual([...core]);
    expect(prime.length).toBeGreaterThan(core.length);
  });
});
