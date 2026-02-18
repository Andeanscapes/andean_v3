'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { useMercadoPagoLink } from '@/hooks/experiences/useMercadoPagoLink';
import {
  useReservationValidation,
  useReservationPricing,
} from '@/hooks/experiences/useReservationContext';
import { reservationSchema } from '@/lib/experiences/validationSchema';
import type { ExperienceConfig } from '@/lib/experiences/types';

interface ConfirmationActionProps {
  config: ExperienceConfig;
  whatsappLink: string;
}

export function ConfirmationAction({
  config,
  whatsappLink,
}: ConfirmationActionProps) {
  const { isValid, state, setTermsAccepted } = useReservationValidation();
  const { depositAmount } = useReservationPricing();
  const { createLink, loading, error } = useMercadoPagoLink(config.id);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handlePayment = async () => {
    setValidationError(null);

    try {
      reservationSchema.parse({
        selectedDateId: state.selectedDateId,
        peopleCount: state.peopleCount,
        roomMode: state.roomMode,
        transportMode: state.transportMode,
        contact: state.contact,
        termsAccepted: state.termsAccepted,
      });

      await createLink(state);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error en la validación';
      setValidationError(errorMessage);
    }
  };

  return (
    <div className="sticky bottom-0 z-50 -mx-4 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 mt-6">
      <Card className="w-full rounded-2xl border border-base-200 bg-base-100/98 p-2 text-base-content shadow-2xl backdrop-blur">
        {/* Términos */}
        <label className="label cursor-pointer mb-1 text-base-content">
          <input
            type="checkbox"
            checked={state.termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="checkbox checkbox-primary"
          />
          <span className="label-text text-xs ml-2 text-base-content/90">
            Acepto términos y condiciones
          </span>
        </label>

        {/* Error messages */}
        {validationError && (
          <div className="alert alert-error mb-2">
            <span className="text-sm">{validationError}</span>
          </div>
        )}
        {error && (
          <div className="alert alert-error mb-2">
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Helper text */}
        {!isValid && (
          <p className="text-xs text-base-content/85 mb-1 text-center">
            Completa todos los campos requeridos para continuar
          </p>
        )}

        {/* Buttons */}
        <div className="space-y-1 mt-2">
          <Button
            onClick={handlePayment}
            disabled={!isValid || loading}
            fullWidth
            className="btn-md btn-primary shadow-lg hover:shadow-xl active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 disabled:opacity-70 disabled:shadow-md min-h-[48px]"
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Procesando...
              </>
            ) : (
              <div className="flex flex-col items-center gap-0.5">
                <span className="font-semibold">
                  {config.microcopy.ctaPrimary}
                </span>
                {isValid && depositAmount > 0 && (
                  <span className="text-[10px] opacity-90">
                    Hoy pagas: $
                    {depositAmount.toLocaleString('es-CO', {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                )}
              </div>
            )}
          </Button>

          <p className="text-xs text-center text-base-content/85">
            Tarjeta · PSE · Pago seguro
          </p>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-xs w-full min-h-0 h-8 text-base-content/80 hover:text-base-content focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
          >
            {config.microcopy.ctaSecondary}
          </a>
        </div>
      </Card>
    </div>
  );
}
