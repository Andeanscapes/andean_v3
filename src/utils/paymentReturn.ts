/**
 * Query parameters a Mercado Pago return adds to the booking URL: our `ref`
 * plus Mercado Pago's own (`back_urls` documentation). Kept in the address bar
 * they would let anyone opening a shared link see the payment result and a
 * WhatsApp message prefilled with the reference.
 */
export const PAYMENT_RETURN_PARAMS = [
  'ref',
  'payment_id',
  'collection_id',
  'collection_status',
  'status',
  'external_reference',
  'payment_type',
  'merchant_order_id',
  'preference_id',
  'site_id',
  'processing_mode',
  'merchant_account_id',
] as const;

/** Same URL without the payment-return parameters; booking selections are kept. */
export function stripPaymentReturnParams(href: string): string {
  const url = new URL(href);
  for (const param of PAYMENT_RETURN_PARAMS) url.searchParams.delete(param);
  const query = url.searchParams.toString();
  return `${url.pathname}${query ? `?${query}` : ''}${url.hash}`;
}
