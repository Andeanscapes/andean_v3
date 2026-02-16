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
