export const PROVIDER_DEFAULTS = {
  slotDurationMinutes: 60,
  bufferMinutes: 15,
  maxAdvanceDays: 90,
  minAdvanceHours: 2,
  maxBookingsPerSlot: 1,
  cancellationPolicyHours: 24,
  autoConfirm: true,
} as const;

export const BOOKING = {
  MAX_NOTES_LENGTH: 1000,
  MIN_DURATION_MINUTES: 5,
  MAX_DURATION_MINUTES: 480,
  STATUSES: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
    NO_SHOW: 'no_show',
  },
} as const;

export const AUTH = {
  SALT_ROUNDS: 12,
  JWT_EXPIRES_IN: '15m',
  REFRESH_EXPIRES_IN: '7d',
  REFRESH_EXPIRES_MS: 7 * 24 * 60 * 60 * 1000,
  MAX_REFRESH_TOKENS_PER_USER: 5,
} as const;

export const RATE_LIMITS = {
  AUTH: {
    ttl: 60000,
    limit: 5,
  },
  API: {
    ttl: 60000,
    limit: 100,
  },
  BOOKING: {
    ttl: 60000,
    limit: 10,
  },
} as const;

export const CACHE = {
  AVAILABILITY_TTL: 60,
  SERVICES_TTL: 300,
  PROVIDER_TTL: 300,
} as const;
