import { act, render, screen, waitFor } from '@/test/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import esMessages from '@/i18n/messages/es.json';

const apiCallMock = vi.fn();
vi.mock('@/lib/api-client', () => ({
  apiCall: (...args: unknown[]) => apiCallMock(...args),
}));

import { PaymentStatusBanner } from './PaymentStatusBanner';

const REF = '3f2c1d4e-5a6b-4c7d-8e9f-0a1b2c3d4e5f';
const ui = esMessages.experiences.ui;
const withRef = (message: string) => message.replace('{reference}', REF);

describe('PaymentStatusBanner', () => {
  afterEach(() => {
    apiCallMock.mockReset();
  });

  it('shows the approved message in a single live region and notifies the page', async () => {
    apiCallMock.mockResolvedValue({ status: 'approved' });
    const onResult = vi.fn();

    render(<PaymentStatusBanner reference={REF} paymentId="123" checkoutUrl={null} experienceTitle="Chivor Tour" onResult={onResult} />);

    expect(screen.getByRole('status')).toHaveTextContent(ui.paymentChecking);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(withRef(ui.paymentStatusApproved)));
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(onResult).toHaveBeenCalledWith('approved');
    expect(String(apiCallMock.mock.calls[0][0])).toContain('payment_id=123');

    expect(screen.getByRole('heading', { name: ui.paymentTitleApproved })).toHaveFocus();
    const whatsapp = screen.getByRole('link', { name: new RegExp(ui.paymentWhatsappApprovedCta) });
    const text = new URL(whatsapp.getAttribute('href') ?? '').searchParams.get('text');
    expect(text).toContain(REF);
    expect(text).toContain('Chivor Tour');
  });

  it('offers WhatsApp help when the payment is not approved', async () => {
    apiCallMock.mockResolvedValue({ status: 'rejected' });

    render(<PaymentStatusBanner reference={REF} paymentId={null} checkoutUrl={null} experienceTitle="Chivor Tour" onResult={vi.fn()} />);

    await waitFor(() => expect(screen.getByRole('heading', { name: ui.paymentTitleRejected })).toBeInTheDocument());
    expect(screen.getByRole('link', { name: new RegExp(ui.paymentWhatsappHelpCta) })).toBeInTheDocument();
  });

  it('shows the pending message without notifying approval', async () => {
    apiCallMock.mockResolvedValue({ status: 'pending' });
    const onResult = vi.fn();

    render(<PaymentStatusBanner reference={REF} paymentId={null} checkoutUrl={null} experienceTitle="Chivor Tour" onResult={onResult} />);

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(withRef(ui.paymentStatusPending)));
    expect(onResult).not.toHaveBeenCalledWith('approved');
  });

  it('shows the error message when the status check fails', async () => {
    apiCallMock.mockRejectedValue(new Error('down'));

    render(<PaymentStatusBanner reference={REF} paymentId={null} checkoutUrl={null} experienceTitle="Chivor Tour" onResult={vi.fn()} />);

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(withRef(ui.paymentStatusError)));
  });

  it('retries a not-found result before reporting it', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    apiCallMock.mockResolvedValueOnce({ status: 'not_found' }).mockResolvedValueOnce({ status: 'approved' });

    render(<PaymentStatusBanner reference={REF} paymentId={null} checkoutUrl={null} experienceTitle="Chivor Tour" onResult={vi.fn()} />);
    await vi.advanceTimersByTimeAsync(2000);
    vi.useRealTimers();

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(withRef(ui.paymentStatusApproved)));
    expect(apiCallMock).toHaveBeenCalledTimes(2);
  });

  describe('watching a checkout opened in another tab', () => {
    const CHECKOUT_URL = 'https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=1';

    afterEach(() => {
      vi.useRealTimers();
    });

    it('waits, offers to reopen checkout, and keeps polling until approved', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      apiCallMock
        .mockResolvedValueOnce({ status: 'not_found' })
        .mockResolvedValueOnce({ status: 'rejected' })
        .mockResolvedValueOnce({ status: 'approved' });
      const onResult = vi.fn();

      render(<PaymentStatusBanner reference={REF} paymentId={null} checkoutUrl={CHECKOUT_URL} experienceTitle="Chivor Tour" onResult={onResult} />);

      expect(screen.getByRole('status')).toHaveTextContent(withRef(ui.paymentWaiting));
      expect(screen.getByRole('link', { name: new RegExp(ui.paymentReopen) })).toHaveAttribute('href', CHECKOUT_URL);
      expect(apiCallMock).not.toHaveBeenCalled();

      await act(() => vi.advanceTimersByTimeAsync(5000));
      expect(screen.getByRole('status')).toHaveTextContent(withRef(ui.paymentWaiting));

      // A rejected card can be retried in the same Mercado Pago tab: keep watching.
      await act(() => vi.advanceTimersByTimeAsync(5000));
      expect(screen.getByRole('status')).toHaveTextContent(withRef(ui.paymentStatusRejected));

      await act(() => vi.advanceTimersByTimeAsync(5000));
      expect(screen.getByRole('status')).toHaveTextContent(withRef(ui.paymentStatusApproved));
      expect(onResult).toHaveBeenCalledWith('approved');
      expect(screen.queryByRole('link', { name: new RegExp(ui.paymentReopen) })).not.toBeInTheDocument();

      await act(() => vi.advanceTimersByTimeAsync(20000));
      expect(apiCallMock).toHaveBeenCalledTimes(3);
    });

    it('checks right away when the customer returns to this tab', async () => {
      apiCallMock.mockResolvedValue({ status: 'approved' });

      render(<PaymentStatusBanner reference={REF} paymentId={null} checkoutUrl={CHECKOUT_URL} experienceTitle="Chivor Tour" onResult={vi.fn()} />);
      document.dispatchEvent(new window.Event('visibilitychange'));

      await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(withRef(ui.paymentStatusApproved)));
      expect(apiCallMock).toHaveBeenCalledTimes(1);
    });

    it('settles on the WhatsApp guidance when the watch window ends without a payment', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
      apiCallMock.mockResolvedValue({ status: 'not_found' });

      render(<PaymentStatusBanner reference={REF} paymentId={null} checkoutUrl={CHECKOUT_URL} experienceTitle="Chivor Tour" onResult={vi.fn()} />);
      await act(() => vi.advanceTimersByTimeAsync(21 * 60 * 1000));

      expect(screen.getByRole('heading', { name: ui.paymentTitleUnconfirmed })).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent(withRef(ui.paymentStatusNotFound));
    });
  });

  it('removes the payment parameters from the URL once the result is shown', async () => {
    // `utm_source` is not owned by the reservation provider the test wrapper mounts.
    window.history.replaceState(null, '', `/experiences/tour/booking?utm_source=wa&ref=${REF}&payment_id=123&status=approved`);
    apiCallMock.mockResolvedValue({ status: 'approved' });

    render(<PaymentStatusBanner reference={REF} paymentId="123" checkoutUrl={null} experienceTitle="Chivor Tour" onResult={vi.fn()} />);

    await waitFor(() => expect(window.location.search).toBe('?utm_source=wa'));
  });
});
