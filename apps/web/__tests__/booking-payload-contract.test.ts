import { describe, it, expect } from 'vitest';
import { createBookingSchema } from '@booking/shared-schemas';

/**
 * These tests verify that the payload ConfirmationStep constructs
 * matches the backend's CreateBookingDto validation.
 * If any of these fail, the frontend will send data the backend rejects.
 */
describe('Booking Payload Contract', () => {
  const validPayload = {
    serviceId: '550e8400-e29b-41d4-a716-446655440000',
    startTime: '2026-04-01T10:00:00.000Z',
    customerEmail: 'test@example.com',
    customerFirstName: 'John',
    customerLastName: 'Doe',
    customerPhone: '+639171234567',
    notes: 'Test booking',
  };

  it('valid full payload passes schema', () => {
    const result = createBookingSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('single name "Madonna" with lastName="-" passes', () => {
    // This is how ConfirmationStep splits single names
    const payload = {
      ...validPayload,
      customerFirstName: 'Madonna',
      customerLastName: '-',
    };
    const result = createBookingSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('multi-word name splits correctly: "John Middle Doe"', () => {
    // ConfirmationStep: nameParts[0] = "John", nameParts.slice(1).join(" ") = "Middle Doe"
    const name = 'John Middle Doe';
    const parts = name.trim().split(/\s+/);
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');

    const payload = { ...validPayload, customerFirstName: firstName, customerLastName: lastName };
    const result = createBookingSchema.safeParse(payload);
    expect(result.success).toBe(true);
    expect(firstName).toBe('John');
    expect(lastName).toBe('Middle Doe');
  });

  it('empty firstName fails schema', () => {
    const payload = { ...validPayload, customerFirstName: '' };
    const result = createBookingSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('firstName over 100 chars fails schema', () => {
    const payload = { ...validPayload, customerFirstName: 'A'.repeat(101) };
    const result = createBookingSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('invalid email fails schema', () => {
    const payload = { ...validPayload, customerEmail: 'not-an-email' };
    const result = createBookingSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('non-UUID serviceId fails schema', () => {
    const payload = { ...validPayload, serviceId: 'not-a-uuid' };
    const result = createBookingSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('non-ISO startTime fails schema', () => {
    const payload = { ...validPayload, startTime: 'next Tuesday' };
    const result = createBookingSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});
