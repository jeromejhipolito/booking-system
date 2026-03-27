import { z } from 'zod';

export const createServiceSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  serviceType: z.enum(['appointment', 'class', 'event', 'workshop']).default('appointment'),
  durationMinutes: z.number().int().min(5).max(480).default(60),
  bufferMinutes: z.number().int().min(0).max(120).default(15),
  price: z.number().min(0).optional(),
  currency: z.string().length(3).default('USD'),
  maxParticipants: z.number().int().min(1).default(1),
  config: z.record(z.any()).default({}),
});

export const createBookingSchema = z.object({
  serviceId: z.string().uuid(),
  startTime: z.string().datetime(),
  customerEmail: z.string().email(),
  customerFirstName: z.string().min(1).max(100),
  customerLastName: z.string().min(1).max(100),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
  idempotencyKey: z.string().optional(),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128).refine((s) => s.trim().length > 0, {
    message: 'Password cannot be only whitespace',
  }),
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  role: z.enum(['provider', 'customer']).default('customer'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const availabilityQuerySchema = z.object({
  providerId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timezone: z.string().default('UTC'),
  serviceId: z.string().uuid().optional(),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type AvailabilityQueryInput = z.infer<typeof availabilityQuerySchema>;
