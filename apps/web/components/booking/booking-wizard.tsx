'use client';

import { useBookingStore } from '@/stores/booking-store';
import ServiceStep from './steps/service-step';
import DateTimeStep from './steps/date-time-step';
import ConfirmationStep from './steps/confirmation-step';

const STEPS = [
  { number: 1, label: 'Service' },
  { number: 2, label: 'Date & Time' },
  { number: 3, label: 'Confirm' },
];

export default function BookingWizard() {
  const { currentStep, selectedService, selectedDate, selectedSlot } = useBookingStore();

  return (
    <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-6">
      {/* Progress Rail — Desktop */}
      <aside className="hidden lg:block">
        <div className="lg:sticky lg:top-20">
          <div className="bg-white rounded-xl border border-muted-200 p-4 space-y-4">
            {STEPS.map((step) => (
              <div key={step.number} className="flex items-start gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                    currentStep > step.number
                      ? 'bg-primary-600 text-white'
                      : currentStep === step.number
                      ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-600'
                      : 'bg-muted-100 text-muted-400'
                  }`}
                >
                  {currentStep > step.number ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-semibold ${
                    currentStep >= step.number ? 'text-muted-900' : 'text-muted-400'
                  }`}>
                    {step.label}
                  </p>
                  {/* Show selected values for completed steps */}
                  {step.number === 1 && currentStep > 1 && selectedService && (
                    <div className="mt-0.5">
                      <p className="text-xs text-muted-600 truncate">{selectedService.name}</p>
                      <p className="text-xs text-muted-400 truncate">{selectedService.provider.name}</p>
                      <p className="text-xs font-medium text-primary-600">₱{selectedService.price.toLocaleString()}</p>
                    </div>
                  )}
                  {step.number === 2 && currentStep > 2 && selectedDate && selectedSlot && (
                    <div className="mt-0.5">
                      <p className="text-xs text-muted-600">{selectedDate}</p>
                      <p className="text-xs text-muted-400">{selectedSlot.startTime} - {selectedSlot.endTime}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Running summary */}
            {selectedService && (
              <div className="pt-3 border-t border-muted-200">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-500">Total</span>
                  <span className="font-bold text-muted-900">₱{selectedService.price.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Progress Bar */}
      <div className="lg:hidden mb-4">
        <div className="bg-white rounded-xl border border-muted-200 px-4 py-3 flex items-center gap-3">
          {STEPS.map((step, idx) => (
            <div key={step.number} className="flex items-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold ${
                  currentStep >= step.number
                    ? 'bg-primary-600 text-white'
                    : 'bg-muted-200 text-muted-500'
                }`}
              >
                {currentStep > step.number ? '✓' : step.number}
              </div>
              <span className={`ml-1.5 text-xs font-medium ${
                currentStep >= step.number ? 'text-muted-900' : 'text-muted-400'
              }`}>
                {step.label}
              </span>
              {idx < STEPS.length - 1 && (
                <div className={`w-6 h-0.5 mx-2 ${
                  currentStep > step.number ? 'bg-primary-600' : 'bg-muted-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="card p-6 sm:p-8">
        {currentStep === 1 && <ServiceStep />}
        {currentStep === 2 && <DateTimeStep />}
        {currentStep === 3 && <ConfirmationStep />}
      </div>
    </div>
  );
}
