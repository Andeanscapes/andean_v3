/**
 * Telegram delivery for operator payment alerts — server only.
 *
 * Uses the WhatsApp sales bot's bot and bridge chat (`TELEGRAM_BOT_TOKEN`,
 * `TELEGRAM_CHAT_ID`). The content is built once in `payment-alert.service.ts`;
 * this file only renders it as Telegram HTML.
 */

import { postAlert } from './alert-http';
import type { AlertEnv, PaymentAlert, SendResult } from './payment-alert.types';

export function isTelegramConfigured(env: AlertEnv): boolean {
  return Boolean(env.TELEGRAM_BOT_TOKEN?.trim() && env.TELEGRAM_CHAT_ID?.trim());
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function renderTelegramAlert(alert: PaymentAlert): string {
  const header = `✅ <b>${escapeHtml(alert.title)}</b>${alert.isSandbox ? ' <i>(SANDBOX, sin dinero real)</i>' : ''}`;
  const body = alert.lines.map((line) =>
    'warning' in line
      ? `⚠️ <b>${escapeHtml(line.warning)}</b>`
      : `<b>${escapeHtml(line.label)}:</b> ${escapeHtml(line.value)}`,
  );
  return [header, '', ...body].join('\n');
}

export async function sendTelegramPaymentAlert(alert: PaymentAlert, env: AlertEnv): Promise<SendResult> {
  const token = env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) return 'rejected';

  return postAlert('telegram', `https://api.telegram.org/bot${token}/sendMessage`, {}, {
    chat_id: chatId,
    text: renderTelegramAlert(alert),
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  });
}
