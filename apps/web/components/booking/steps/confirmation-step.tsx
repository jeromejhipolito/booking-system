'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/stores/booking-store';
import { api } from '@/lib/api-client';

export default function ConfirmationStep() {
  const router = useRouter();
  const { selectedService, selectedSlot, selectedDate, customerInfo, setCustomerInfo, prevStep } =
    useBookingStore();

  const [name, setName] = useState(customerInfo.name);
  const [email, setEmail] = useState(customerInfo.email);
  const [phone, setPhone] = useState(customerInfo.phone);
  const [notes, setNotes] = useState(customerInfo.notes);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validateName = () => {
    if (!name.trim()) {
      setNameError('Name is required');
      return false;
    }
    setNameError('');
    return true;
  };

  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePhone = () => {
    if (!phone.trim()) {
      setPhoneError('Phone number is required');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isPhoneValid = validatePhone();

    if (!isNameValid || !isEmailValid || !isPhoneValid) return;

    setCustomerInfo({ name, email, phone, notes });
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Build the ISO startTime: use the _isoStart stored on the slot, or reconstruct from date + time
      let startTimeIso: string;
      const slotAny = selectedSlot as any;
      if (slotAny?._isoStart) {
        startTimeIso = slotAny._isoStart;
      } else if (selectedDate && selectedSlot?.startTime) {
        startTimeIso = `${selectedDate}T${selectedSlot.startTime}:00.000Z`;
      } else {
        throw new Error('No time slot selected');
      }

      // Split full name into first + last (backend expects separate fields)
      const nameParts = name.trim().split(/\s+/);
      const customerFirstName = nameParts[0] || name.trim();
      const customerLastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '-';

      const idempotencyKey = crypto.randomUUID();

      const bookingData = {
        serviceId: selectedService?.id,
        startTime: startTimeIso,
        customerEmail: email.trim(),
        customerFirstName,
        customerLastName,
        customerPhone: phone.trim(),
        notes: notes.trim() || undefined,
      };

      const result = await api.createBooking(bookingData, idempotencyKey) as any;

      // Store booking ID for the confirmed page
      if (typeof window !== 'undefined' && result?.id) {
        sessionStorage.setItem('lastBookingId', result.id);
        if (result.accessToken) {
          sessionStorage.setItem('lastBookingToken', result.accessToken);
        }
      }

      router.push('/book/confirmed');
    } catch (err: any) {
      const msg = err.message || 'Booking failed';
      if (msg.includes('already booked') || msg.includes('conflict') || msg.includes('409')) {
        setSubmitError('This time slot has just been taken. Please go back and choose a different time.');
      } else {
        setSubmitError(msg);
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-muted-900 mb-1">Confirm Your Booking</h2>
      <p className="text-sm text-muted-500 mb-6">Review the details and provide your information</p>

      {/* Booking Summary */}
      <div className="bg-primary-50 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-primary-700 mb-3">Booking Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-600">Service</span>
            <span className="text-sm font-medium text-muted-900">{selectedService?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-600">Provider</span>
            <span className="text-sm font-medium text-muted-900">{selectedService?.provider.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-600">Date</span>
            <span className="text-sm font-medium text-muted-900">{selectedDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-600">Time</span>
            <span className="text-sm font-medium text-muted-900">
              {selectedSlot?.startTime} - {(() => {
                if (!selectedSlot?.startTime || !selectedService?.duration) return selectedSlot?.endTime;
                const [h, m] = selectedSlot.startTime.split(':').map(Number);
                const totalMin = h * 60 + m + selectedService.duration;
                return `${String(Math.floor(totalMin / 60)).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;
              })()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-600">Duration</span>
            <span className="text-sm font-medium text-muted-900">{selectedService?.duration} min</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-primary-200">
            <span className="text-sm font-semibold text-muted-900">Total</span>
            <span className="text-lg font-bold text-primary-700">₱{selectedService?.price.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Submit Error */}
      {submitError && (
        <div className="mb-4 bg-danger-50 border border-danger-200 rounded-lg p-4">
          <p className="text-sm text-danger-700">{submitError}</p>
        </div>
      )}

      {/* Customer Info Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="cust-name" className="block text-sm font-medium text-muted-700 mb-1.5">
            Full Name *
          </label>
          <input
            id="cust-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={validateName}
            placeholder="Your full name"
            className={`input-field ${nameError ? 'border-danger-500' : ''}`}
          />
          {nameError && <p className="mt-1 text-sm text-danger-600">{nameError}</p>}
        </div>

        <div>
          <label htmlFor="cust-email" className="block text-sm font-medium text-muted-700 mb-1.5">
            Email *
          </label>
          <input
            id="cust-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={validateEmail}
            placeholder="you@example.com"
            className={`input-field ${emailError ? 'border-danger-500' : ''}`}
          />
          {emailError && <p className="mt-1 text-sm text-danger-600">{emailError}</p>}
        </div>

        <div>
          <label htmlFor="cust-phone" className="block text-sm font-medium text-muted-700 mb-1.5">
            Phone Number *
          </label>
          <input
            id="cust-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={validatePhone}
            placeholder="+63 917 123 4567"
            className={`input-field ${phoneError ? 'border-danger-500' : ''}`}
          />
          {phoneError && <p className="mt-1 text-sm text-danger-600">{phoneError}</p>}
        </div>

        <div>
          <label htmlFor="cust-notes" className="block text-sm font-medium text-muted-700 mb-1.5">
            Notes (optional)
          </label>
          <textarea
            id="cust-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special requests or notes..."
            rows={3}
            className="input-field resize-none"
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t border-muted-200">
          <button type="button" onClick={prevStep} className="btn-secondary">
            Back
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex items-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Booking...
              </>
            ) : (
              'Confirm Booking'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
