'use client';

import { useState } from 'react';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];
const TIMEZONE_OPTIONS = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
];

export default function OnboardingPage() {
  // Step tracking
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Business info
  const [businessName, setBusinessName] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [address, setAddress] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');

  // Step 2: Service info
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [price, setPrice] = useState('');

  // Step 3: Weekly schedule
  const [activeDays, setActiveDays] = useState<Record<string, boolean>>({
    Monday: true,
    Tuesday: true,
    Wednesday: true,
    Thursday: true,
    Friday: true,
    Saturday: false,
    Sunday: false,
  });
  const [startHour, setStartHour] = useState('09:00');
  const [endHour, setEndHour] = useState('17:00');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const toggleDay = (day: string) => {
    setActiveDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { api } = await import('../../../lib/api-client');
      const provider: any = await api.createProvider({ businessName, timezone, address: address || undefined });
      await api.createService({ providerId: provider.id, name: serviceName, serviceType: 'appointment', durationMinutes: duration, price: parseFloat(price), currency: 'USD' });
      const byDay = ['MO','TU','WE','TH','FR','SA','SU'].filter((_, i) => activeDays[Object.keys(activeDays)[i]]).join(',');
      await api.createAvailability({ providerId: provider.id, rrule: `DTSTART:20260101T${startHour.replace(':','')}00Z\nRRULE:FREQ=WEEKLY;BYDAY=${byDay}`, timezone, effectiveFrom: '2026-01-01' });
      setIsComplete(true);
    } catch (err: any) {
      alert(err.message || 'Setup failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-16 h-16 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-muted-900">You&apos;re All Set!</h1>
        <p className="mt-2 text-muted-500">Your business profile has been created. You can start accepting bookings.</p>
        <a href="/dashboard" className="mt-6 btn-primary inline-block">
          Go to Dashboard
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-muted-900">Set Up Your Business</h1>
        <p className="text-sm text-muted-500 mt-1">Complete these steps to start accepting bookings</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8 max-w-md">
        {[1, 2, 3].map((step, idx) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep >= step
                  ? 'bg-primary-600 text-white'
                  : 'bg-muted-200 text-muted-500'
              }`}
            >
              {currentStep > step ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step
              )}
            </div>
            {idx < 2 && (
              <div className={`w-16 h-0.5 mx-2 ${currentStep > step ? 'bg-primary-600' : 'bg-muted-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="card p-6 sm:p-8">
        {/* Step 1: Business Info */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-muted-900 mb-1">Business Information</h2>
            <p className="text-sm text-muted-500 mb-6">Tell us about your business</p>

            <div className="space-y-4">
              <div>
                <label htmlFor="biz-name" className="block text-sm font-medium text-muted-700 mb-1.5">
                  Business Name *
                </label>
                <input
                  id="biz-name"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Elena's Salon"
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="biz-desc" className="block text-sm font-medium text-muted-700 mb-1.5">
                  Description
                </label>
                <textarea
                  id="biz-desc"
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  placeholder="Brief description of your business..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-muted-700 mb-1.5">
                  Business Address
                </label>
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 123 Main St, City"
                  maxLength={500}
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="timezone" className="block text-sm font-medium text-muted-700 mb-1.5">
                  Timezone *
                </label>
                <select
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="input-field"
                >
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleNext}
                disabled={!businessName.trim()}
                className="btn-primary disabled:opacity-50"
              >
                Next: Add Service
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Service Info */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-muted-900 mb-1">Your First Service</h2>
            <p className="text-sm text-muted-500 mb-6">Set up the service you want to offer</p>

            <div className="space-y-4">
              <div>
                <label htmlFor="svc-name" className="block text-sm font-medium text-muted-700 mb-1.5">
                  Service Name *
                </label>
                <input
                  id="svc-name"
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="e.g. Haircut & Styling"
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="svc-desc" className="block text-sm font-medium text-muted-700 mb-1.5">
                  Description
                </label>
                <textarea
                  id="svc-desc"
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  placeholder="What's included in this service?"
                  rows={2}
                  className="input-field resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-700 mb-2">
                  Duration (minutes) *
                </label>
                <div className="flex flex-wrap gap-2">
                  {DURATION_OPTIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        duration === d
                          ? 'bg-blue-600 text-white'
                          : 'bg-muted-100 text-muted-600 hover:bg-muted-200'
                      }`}
                    >
                      {d} min
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="svc-price" className="block text-sm font-medium text-muted-700 mb-1.5">
                  Price ($) *
                </label>
                <input
                  id="svc-price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="45"
                  min="0"
                  className="input-field max-w-[200px]"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button onClick={handleBack} className="btn-secondary">
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!serviceName.trim() || !price}
                className="btn-primary disabled:opacity-50"
              >
                Next: Set Schedule
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Weekly Schedule */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-muted-900 mb-1">Weekly Schedule</h2>
            <p className="text-sm text-muted-500 mb-6">Set your availability for each day</p>

            {/* Day Toggles */}
            <div className="space-y-2 mb-6">
              {DAYS_OF_WEEK.map((day) => (
                <div
                  key={day}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    activeDays[day] ? 'border-primary-200 bg-primary-50' : 'border-muted-200 bg-muted-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`w-10 h-6 rounded-full relative transition-colors ${
                        activeDays[day] ? 'bg-primary-600' : 'bg-muted-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                          activeDays[day] ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                    <span className={`text-sm font-medium ${activeDays[day] ? 'text-muted-900' : 'text-muted-400'}`}>
                      {day}
                    </span>
                  </div>
                  {activeDays[day] && (
                    <div className="flex items-center space-x-2 text-sm text-muted-600">
                      <input
                        type="time"
                        value={startHour}
                        onChange={(e) => setStartHour(e.target.value)}
                        className="border border-muted-300 rounded px-2 py-1 text-sm"
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={endHour}
                        onChange={(e) => setEndHour(e.target.value)}
                        className="border border-muted-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <button onClick={handleBack} className="btn-secondary">
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-primary flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Complete Setup'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
