/**
 * Operator alerts for approved web deposits — server only.
 *
 * Builds one channel-neutral alert from the Mercado Pago payment `metadata`
 * (written by the server at checkout, never from the browser), then sends it to
 * every configured channel: Telegram and email.
 *
 * Each channel is claimed separately, so a failure in one never blocks or
 * repeats the other. Triggered from the status check, so it is best effort until
 * the Mercado Pago webhook exists: no status check, no alert.
 */

import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import { ExperienceIdSchema } from '../schemas/experience-codes.schema';
import { EXPERIENCE_I18N } from '@/i18n/mappings/experience';
import { formatMoney } from '@/utils/formatCurrency';
import { claimAlert, releaseAlert } from './alert-claims';
import { isEmailConfigured, sendEmailPaymentAlert } from './email-alert.service';
import { isTelegramConfigured, sendTelegramPaymentAlert } from './telegram.service';
import type { AlertEnv, AlertLine, ApprovedPayment, PaymentAlert, SendResult } from './payment-alert.types';

export type { ApprovedPayment, PaymentAlert } from './payment-alert.types';

interface AlertChannel {
  name: 'telegram' | 'email';
  isConfigured(env: AlertEnv): boolean;
  send(alert: PaymentAlert, env: AlertEnv): Promise<SendResult>;
}

const CHANNELS: readonly AlertChannel[] = [
  { name: 'telegram', isConfigured: isTelegramConfigured, send: sendTelegramPaymentAlert },
  { name: 'email', isConfigured: isEmailConfigured, send: sendEmailPaymentAlert },
];

/**
 * Each field falls back on its own: one malformed value must not blank the
 * rest of the alert.
 */
const optionalString = z.string().optional().catch(undefined);
const optionalNumber = z.coerce.number().optional().catch(undefined);

const metadataSchema = z.object({
  experience_id: optionalString,
  tier_id: optionalString,
  date_id: optionalString,
  people_count: optionalNumber,
  room_selections: z
    .array(
      z.object({
        // Mercado Pago snake-cases metadata keys, nested ones included.
        room_mode: z.string().optional(),
        roomMode: z.string().optional(),
        quantity: z.coerce.number(),
      }),
    )
    .optional()
    .catch(undefined),
  transport_mode: optionalString,
  total_amount: optionalNumber,
  deposit_percent: optionalNumber,
  contact_name: optionalString,
  contact_phone: optionalString,
  contact_email: optionalString,
});

type PaymentMetadata = z.infer<typeof metadataSchema>;

function display(value: string | number | null | undefined): string {
  return value === undefined || value === null || value === '' ? '—' : String(value);
}

function money(value: number | undefined | null): string {
  return typeof value === 'number' && Number.isFinite(value) ? formatMoney(value, 'es', 'COP') : '—';
}

async function experienceTitle(experienceId: string | undefined): Promise<string> {
  const parsed = ExperienceIdSchema.safeParse(experienceId);
  if (!parsed.success) return display(experienceId);
  const mapping = (EXPERIENCE_I18N as Partial<Record<string, { title: string }>>)[parsed.data];
  if (!mapping) return parsed.data;
  const t = await getTranslations({ locale: 'es' });
  return t(mapping.title);
}

export async function buildPaymentAlert(payment: ApprovedPayment): Promise<PaymentAlert> {
  const parsed = metadataSchema.safeParse(payment.metadata ?? {});
  const meta: PaymentMetadata = parsed.success ? parsed.data : {};
  const expectedDeposit =
    meta.total_amount !== undefined && meta.deposit_percent !== undefined
      ? Math.round(meta.total_amount * (meta.deposit_percent / 100))
      : null;
  const amountMismatch = expectedDeposit !== null && payment.amount !== null && payment.amount !== expectedDeposit;
  const rooms = (meta.room_selections ?? [])
    .map((room) => `${room.quantity}× ${room.room_mode ?? room.roomMode ?? '?'}`)
    .join(', ');

  const lines: AlertLine[] = [
    { label: 'Experiencia', value: await experienceTitle(meta.experience_id) },
    { label: 'Fecha', value: display(meta.date_id) },
    { label: 'Personas', value: display(meta.people_count) },
    { label: 'Alojamiento', value: display(meta.tier_id) },
    { label: 'Habitaciones', value: display(rooms) },
    { label: 'Transporte', value: display(meta.transport_mode) },
    { label: 'Total reserva', value: money(meta.total_amount) },
    {
      label: 'Pagado',
      value: `${money(payment.amount)}${meta.deposit_percent !== undefined ? ` (${meta.deposit_percent}%)` : ''}`,
    },
    ...(amountMismatch
      ? [{ warning: `El monto pagado no coincide con el depósito esperado (${money(expectedDeposit)}).` }]
      : []),
    { label: 'Cliente', value: display(meta.contact_name) },
    { label: 'Teléfono', value: display(meta.contact_phone) },
    { label: 'Email', value: display(meta.contact_email) },
    { label: 'Operación Mercado Pago', value: `#${payment.paymentId}` },
    { label: 'Referencia', value: payment.externalReference },
  ];

  return {
    title: 'Depósito recibido — Web',
    isSandbox: payment.isSandbox,
    lines,
    paymentId: payment.paymentId,
    externalReference: payment.externalReference,
  };
}

let warnedNoChannel = false;

async function sendOnce(channel: AlertChannel, alert: PaymentAlert, origin: string, env: AlertEnv): Promise<void> {
  if (!(await claimAlert(channel.name, alert.paymentId, origin))) return;

  const result = await channel.send(alert, env).catch((): SendResult => 'retry');
  if (result === 'sent') {
    console.info(`[PaymentAlert] ${channel.name} sent payment=${alert.paymentId}`);
  } else if (result === 'retry') {
    await releaseAlert(channel.name, alert.paymentId, origin);
  }
}

/** Whether any alert channel is configured; logs the gap once per isolate. */
export function hasAlertChannel(env: AlertEnv = process.env): boolean {
  const configured = CHANNELS.some((channel) => channel.isConfigured(env));
  if (!configured && !warnedNoChannel) {
    warnedNoChannel = true;
    console.warn('[PaymentAlert] no alert channel configured; alerts skipped');
  }
  return configured;
}

/**
 * Send a built alert to every configured channel, once each. Takes the alert
 * already built: building needs the request scope (translations), while this
 * runs after the response. Never throws.
 */
export async function dispatchPaymentAlert(
  alert: PaymentAlert,
  origin: string,
  env: AlertEnv = process.env,
): Promise<void> {
  const configured = CHANNELS.filter((channel) => channel.isConfigured(env));
  await Promise.allSettled(configured.map((channel) => sendOnce(channel, alert, origin, env)));
}
