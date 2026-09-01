/**
 * Guards for the frontend-owned landing structure.
 *
 * Written after shipping `secondaryCtaHref: '#reviews'` when the element the
 * Reviews section actually renders is `id="landing-reviews"` — a dead CTA that
 * typecheck, lint and every render test passed straight over, because an anchor
 * pointing at nothing is still valid markup.
 *
 * These assertions are static: they read the component sources rather than
 * mounting the page, so they stay fast and need no feed.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

import enMessages from '@/i18n/messages/en.json';
import esMessages from '@/i18n/messages/es.json';
import frMessages from '@/i18n/messages/fr.json';
import { LANDING_ICON_NAMES } from '@/utils/landingIconMap';
import { LANDING_STRUCTURE } from './landing.structure';

const LOCALES = { en: enMessages, es: esMessages, fr: frMessages };
const COMPONENTS_DIR = path.resolve(__dirname, '../../components');
const PUBLIC_DIR = path.resolve(__dirname, '../../../public');

function walkFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      walkFiles(full, acc);
    } else if (entry.endsWith('.tsx')) {
      acc.push(full);
    }
  }
  return acc;
}

/** Every `id="…"` rendered by a component, excluding test and story files. */
const RENDERED_IDS = new Set(
  walkFiles(COMPONENTS_DIR)
    .filter((file) => !/\.(test|stories)\.tsx$/.test(file))
    .flatMap((file) =>
      Array.from(readFileSync(file, 'utf8').matchAll(/\bid="([^"]+)"/g), (m) => m[1]),
    ),
);

/** Depth-first collection of every string in the structure, with its path. */
function collectStrings(node: unknown, at = '', acc: [string, string][] = []): [string, string][] {
  if (typeof node === 'string') {
    acc.push([at, node]);
    return acc;
  }
  if (Array.isArray(node)) {
    node.forEach((item, i) => collectStrings(item, `${at}[${i}]`, acc));
    return acc;
  }
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      collectStrings(value, at ? `${at}.${key}` : key, acc);
    }
  }
  return acc;
}

const ENTRIES = collectStrings(LANDING_STRUCTURE);

function resolveKey(messages: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>((node, part) => {
    if (node && typeof node === 'object' && part in node) {
      return (node as Record<string, unknown>)[part];
    }
    return undefined;
  }, messages);
}

describe('landing structure', () => {
  it('every in-page anchor targets an id a component actually renders', () => {
    const anchors = ENTRIES.filter(([, value]) => value.startsWith('#'));

    expect(anchors.length).toBeGreaterThan(0);

    const dangling = anchors.filter(([, value]) => !RENDERED_IDS.has(value.slice(1)));
    expect(dangling, 'anchors pointing at no rendered id').toEqual([]);
  });

  it('every *Key resolves to a string in en/es/fr', () => {
    const keys = ENTRIES.filter(([at]) => at.endsWith('Key')).map(([, value]) => value);

    expect(keys.length).toBeGreaterThan(0);

    for (const [locale, messages] of Object.entries(LOCALES)) {
      const missing = keys.filter((key) => typeof resolveKey(messages, key) !== 'string');
      expect(missing, `keys missing in ${locale}`).toEqual([]);
    }
  });

  it('every iconName exists in the landing icon map', () => {
    const icons = ENTRIES.filter(([at]) => at.endsWith('iconName')).map(([, value]) => value);

    expect(icons.length).toBeGreaterThan(0);

    const unknown = icons.filter((icon) => !LANDING_ICON_NAMES.has(icon));
    expect(unknown, 'icon names with no entry in landingIconMap').toEqual([]);
  });

  it('every referenced image exists on disk', () => {
    const images = ENTRIES.filter(([, value]) => /^\/.+\.(webp|png|jpg|svg)$/.test(value)).map(
      ([, value]) => value,
    );

    expect(images.length).toBeGreaterThan(0);

    const missing = images.filter((src) => {
      try {
        return !statSync(path.join(PUBLIC_DIR, src)).isFile();
      } catch {
        return true;
      }
    });
    expect(missing, 'images referenced but not present in public/').toEqual([]);
  });

  it('carries no user-facing copy — only keys, routes, icons and images', () => {
    const suspicious = ENTRIES.filter(([at, value]) => {
      if (at.endsWith('Key')) return false;
      if (value.startsWith('/') || value.startsWith('#')) return false;
      if (at.endsWith('iconName')) return false;
      // ids and the faq id list are identifiers, not copy
      if (at.endsWith('.id') || at.startsWith('faqs.itemIds')) return false;
      return true;
    });

    expect(suspicious, 'structure entries that look like literal copy').toEqual([]);
  });
});
