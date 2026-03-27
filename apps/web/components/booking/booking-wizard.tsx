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
  const currentStep = useBookingStore((s) => s.currentStep);

  return (
    <div>
      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          {STEPS.map((step, idx) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    currentStep >= step.number
                      ? 'bg-primary-600 text-white'
                      : 'bg-muted-200 text-muted-500'
                  }`}
                >
                  {currentStep > step.number ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    currentStep >= step.number ? 'text-primary-600' : 'text-muted-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`w-20 sm:w-32 h-0.5 mx-2 mt-[-1rem] ${
                    currentStep > step.number ? 'bg-primary-600' : 'bg-muted-200'
                  }`}
                />
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
