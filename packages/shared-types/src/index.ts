export enum ServiceType {
  APPOINTMENT = 'appointment',
  CLASS = 'class',
  EVENT = 'event',
  WORKSHOP = 'workshop',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show',
}

export enum UserRole {
  ADMIN = 'admin',
  PROVIDER = 'provider',
  CUSTOMER = 'customer',
}

export interface IService {
  id: string;
  providerId: string;
  name: string;
  description?: string;
  serviceType: ServiceType;
  durationMinutes: number;
  bufferMinutes: number;
  price?: number;
  currency?: string;
  maxParticipants: number;
  isActive: boolean;
  config: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBooking {
  id: string;
  serviceId: string;
  providerId: string;
  customerId: string;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  notes?: string;
  cancellationReason?: string;
  idempotencyKey?: string;
  accessToken?: string;
  version: number;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProvider {
  id: string;
  userId: string;
  businessName: string;
  description?: string;
  phone?: string;
  timezone: string;
  settings: IProviderSettings;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProviderSettings {
  slotDurationMinutes: number;
  bufferMinutes: number;
  maxAdvanceDays: number;
  minAdvanceHours: number;
  maxBookingsPerSlot: number;
  cancellationPolicyHours: number;
  autoConfirm: boolean;
}

export interface ICustomer {
  id: string;
  userId?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAvailabilityRule {
  id: string;
  providerId: string;
  title?: string;
  rrule: string;
  startTime: string;
  endTime: string;
  timezone: string;
  exceptions: IAvailabilityException[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAvailabilityException {
  date: string;
  reason?: string;
}

export interface ITimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface IAvailabilityResponse {
  providerId: string;
  date: string;
  timezone: string;
  slots: ITimeSlot[];
}

export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
