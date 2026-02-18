import { z } from 'zod';

export const reservationSchema = z.object({
  selectedDateId: z
    .string()
    .min(1, 'Selecciona una fecha disponible'),

  peopleCount: z
    .number()
    .min(1, 'Mínimo 1 persona')
    .max(10, 'Máximo 10 personas'),

  roomMode: z.enum(['private', 'couple']),

  transportMode: z.enum(['car_no_4x4', 'have_4x4', 'bus']).refine(
    (val) => !!val,
    { message: 'Selecciona tu modo de transporte' }
  ),

  contact: z.object({
    name: z
      .string()
      .min(2, 'Nombre requerido (mínimo 2 caracteres)'),
    phone: z
      .string()
      .regex(
        /^\+?[\d\s\-()]{7,}$/,
        'Celular inválido (mínimo 7 dígitos)'
      ),
    email: z
      .string()
      .email('Email inválido')
      .optional()
      .or(z.literal('')),
  }),

  termsAccepted: z
    .boolean()
    .refine((val) => val === true, {
      message: 'Debes aceptar los términos y condiciones',
    }),
});

export type ReservationFormData = z.infer<typeof reservationSchema>;

export function validateReservationField(
  field: keyof ReservationFormData,
  value: unknown
): string | null {
  try {
    if (field === 'selectedDateId') {
      reservationSchema.shape.selectedDateId.parse(value);
    } else if (field === 'peopleCount') {
      reservationSchema.shape.peopleCount.parse(value);
    } else if (field === 'roomMode') {
      reservationSchema.shape.roomMode.parse(value);
    } else if (field === 'transportMode') {
      reservationSchema.shape.transportMode.parse(value);
    } else if (field === 'contact') {
      reservationSchema.shape.contact.parse(value);
    } else if (field === 'termsAccepted') {
      reservationSchema.shape.termsAccepted.parse(value);
    }
    return null;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return err.issues?.[0]?.message || 'Error de validación';
    }
    return 'Error de validación';
  }
}

export function flattenZodErrors(error: z.ZodError): Record<string, string> {
  return error.issues.reduce(
    (acc, err) => {
      const path = err.path.join('.');
      if (!acc[path]) {
        acc[path] = err.message;
      }
      return acc;
    },
    {} as Record<string, string>
  );
}

export function validateContactField(
  field: 'name' | 'phone' | 'email',
  value: string
): string | null {
  try {
    const contactSchema = reservationSchema.shape.contact;
    if (field === 'name') {
      contactSchema.shape.name.parse(value);
    } else if (field === 'phone') {
      contactSchema.shape.phone.parse(value);
    } else if (field === 'email') {
      contactSchema.shape.email.parse(value);
    }
    return null;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return err.issues?.[0]?.message || 'Error de validación';
    }
    return 'Error de validación';
  }
}
