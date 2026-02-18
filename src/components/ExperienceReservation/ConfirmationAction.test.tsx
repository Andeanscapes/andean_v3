import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ConfirmationAction } from './ConfirmationAction';
import { MOCK_TRANSLATED_CONFIG } from '@/test/test-utils';

const MOCK_WHATSAPP_LINK =
  'https://wa.me/573142730360?text=Hola%2C%20quiero%20reservar';

describe('ConfirmationAction', () => {
  it('renders buttons', () => {
    render(
      <ConfirmationAction
        config={MOCK_TRANSLATED_CONFIG}
        whatsappLink={MOCK_WHATSAPP_LINK}
      />
    );
    expect(
      screen.getByText(MOCK_TRANSLATED_CONFIG.microcopy.ctaPrimary)
    ).toBeInTheDocument();
    expect(
      screen.getByText(MOCK_TRANSLATED_CONFIG.microcopy.ctaSecondary)
    ).toBeInTheDocument();
  });

  it('renders terms checkbox', () => {
    render(
      <ConfirmationAction
        config={MOCK_TRANSLATED_CONFIG}
        whatsappLink={MOCK_WHATSAPP_LINK}
      />
    );
    expect(
      screen.getByText(/Acepto términos y condiciones/)
    ).toBeInTheDocument();
  });

  it('pay button is disabled by default', () => {
    render(
      <ConfirmationAction
        config={MOCK_TRANSLATED_CONFIG}
        whatsappLink={MOCK_WHATSAPP_LINK}
      />
    );
    const payBtn = screen.getByText(MOCK_TRANSLATED_CONFIG.microcopy.ctaPrimary);
    // Note: button may be wrapped in a larger button element
    expect(payBtn.closest('button')).toBeDisabled();
  });

  it('whatsapp link opens in new tab', () => {
    render(
      <ConfirmationAction
        config={MOCK_TRANSLATED_CONFIG}
        whatsappLink={MOCK_WHATSAPP_LINK}
      />
    );
    const whatsappLink = screen
      .getByText(MOCK_TRANSLATED_CONFIG.microcopy.ctaSecondary)
      .closest('a');
    expect(whatsappLink).toHaveAttribute('target', '_blank');
  });

  it('toggles terms checkbox', async () => {
    const user = userEvent.setup();
    render(
      <ConfirmationAction
        config={MOCK_TRANSLATED_CONFIG}
        whatsappLink={MOCK_WHATSAPP_LINK}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });
});
