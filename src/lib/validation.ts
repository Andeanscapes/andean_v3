// src/lib/validation.ts
/**
 * Data validation helpers using Zod.
 * Central place for all schema definitions and validation logic.
 */

import { z } from 'zod';

// Common schemas
export const tourFilterSchema = z.object({
  search: z.string().min(1).max(100).optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  region: z.enum(['north', 'south', 'center', 'all']).optional(),
  duration: z.string().optional(), // "1-3", "4-7", "8+"
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20)
});

export type TourFilters = z.infer<typeof tourFilterSchema>;

export const createTourSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  price: z.number().positive(),
  duration: z.number().int().positive(),
  capacity: z.number().int().positive().max(50),
  region: z.enum(['north', 'south', 'center']),
  highlights: z.array(z.string()).min(1).max(10),
  images: z.array(z.string().url()).min(1).max(20),
  startDate: z.string().datetime().optional(),
  itinerary: z.array(z.object({
    day: z.number().positive(),
    title: z.string(),
    description: z.string()
  })).min(1)
});

export type CreateTour = z.infer<typeof createTourSchema>;

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(12).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
    'Password must contain lowercase, uppercase, number, and special character'
  ),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export type SignupData = z.infer<typeof signupSchema>;

/**
 * Safe validation wrapper with error normalization
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format errors for API response
      const formatted = error.flatten();
      const message = Object.entries(formatted.fieldErrors)
        .map(([field, errors]) => {
          const safeErrors = Array.isArray(errors) ? errors : [];
          return `${field}: ${safeErrors.join(', ')}`;
        })
        .join('; ');
      throw new Error(`Validation failed: ${message}`);
    }
    throw error;
  }
}

/**
 * Safe parse without throwing
 */
export function tryValidate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string[]> } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.flatten().fieldErrors as Record<string, string[]>
  };
}
