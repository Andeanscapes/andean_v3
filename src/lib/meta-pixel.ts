type FbqArgs = [string, string, Record<string, unknown>?];

type FbqWindow = {
  fbq?: (...args: FbqArgs) => void;
};

function getFbq() {
  return (globalThis as typeof globalThis & FbqWindow).fbq;
}

export function trackMetaCustomEvent(
  eventName: string,
  params?: Record<string, unknown>
) {
  const fbq = getFbq();
  if (typeof fbq !== 'function') return;
  fbq('trackCustom', eventName, params);
}

export function trackLandingActionToBook(
  action: 'airbnb' | 'whatsapp',
  placement: string
) {
  trackMetaCustomEvent('LandingActionToBook', {action, placement});
}

/**
 * Helper function to track booking CTA interactions.
 * Consolidates dual tracking pattern (legacy event + normalized event) into a single call.
 * 
 * @param action - The action type ('airbnb' or 'whatsapp')
 * @param placement - The UI placement identifier (e.g., 'booking_cta', 'booking_cta_sticky')
 */
export function trackBookingCtaClick(
  action: 'airbnb' | 'whatsapp',
  placement: string
) {
  // Track legacy event for backwards compatibility
  const legacyEventName = action === 'airbnb' ? 'AirbnbClick' : 'WhatsAppClick';
  trackMetaCustomEvent(legacyEventName, { placement });
  
  // Track normalized event for consistent analytics
  trackLandingActionToBook(action, placement);
}
