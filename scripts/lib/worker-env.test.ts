import { describe, expect, it } from 'vitest';
import { filterWorkerEnvSource, isPublicWorkerEnvKey } from './worker-env';

const SOURCE = [
  'export const production = {"REMOTE_DATA_BASE_URL":"https://cdn.example.com","NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER":"570000000000","MERCADOPAGO_ACCESS_TOKEN":"secret-1","TELEGRAM_BOT_TOKEN":"secret-2"};',
  'export const development = {"RESEND_API_KEY":"secret-3","GOOGLE_SITE_VERIFICATION":"public"};',
  'export const test = {};',
  '',
].join('\n');

describe('isPublicWorkerEnvKey', () => {
  it('keeps public configuration and drops everything else', () => {
    expect(isPublicWorkerEnvKey('NEXT_PUBLIC_CDN_BASE_URL')).toBe(true);
    expect(isPublicWorkerEnvKey('REMOTE_DATA_BASE_URL')).toBe(true);
    expect(isPublicWorkerEnvKey('MERCADOPAGO_ACCESS_TOKEN')).toBe(false);
    expect(isPublicWorkerEnvKey('ALERT_EMAIL_TO')).toBe(false);
  });
});

describe('filterWorkerEnvSource', () => {
  it('removes secret values from every mode and reports the dropped keys', () => {
    const { source, dropped } = filterWorkerEnvSource(SOURCE);

    expect(source).not.toContain('secret-');
    expect(source).toContain('"REMOTE_DATA_BASE_URL":"https://cdn.example.com"');
    expect(source).toContain('"GOOGLE_SITE_VERIFICATION":"public"');
    expect(source).toContain('export const test = {};');
    expect(dropped).toEqual(['MERCADOPAGO_ACCESS_TOKEN', 'RESEND_API_KEY', 'TELEGRAM_BOT_TOKEN']);
  });

  it('reports zero matched exports for an unrecognised format', () => {
    expect(filterWorkerEnvSource('module.exports = { SECRET: "x" };').matched).toBe(0);
  });

  it('leaves an already clean file unchanged', () => {
    const clean = 'export const production = {"REMOTE_DATA_BASE_URL":"x"};\n';
    expect(filterWorkerEnvSource(clean)).toEqual({ source: clean, dropped: [], matched: 1 });
  });
});
