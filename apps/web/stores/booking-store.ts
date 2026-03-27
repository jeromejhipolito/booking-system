import { create } from 'zustand';
import type { Service, TimeSlot } from '@/lib/mock-data';

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

interface BookingState {
  selectedService: Service | null;
  selectedStaffId: string | null;
  selectedDate: string | null;
  selectedSlot: TimeSlot | null;
  customerInfo: CustomerInfo;
  currentStep: number;

  setSelectedService: (service: Service | null) => void;
  setSelectedStaffId: (staffId: string | null) => void;
  setSelectedDate: (date: string | null) => void;
  setSelectedSlot: (slot: TimeSlot | null) => void;
  setCustomerInfo: (info: Partial<CustomerInfo>) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const initialCustomerInfo: CustomerInfo = {
  name: '',
  email: '',
  phone: '',
  notes: '',
};

export const useBookingStore = create<BookingState>((set) => ({
  selectedService: null,
  selectedStaffId: null,
  selectedDate: null,
  selectedSlot: null,
  customerInfo: { ...initialCustomerInfo },
  currentStep: 1,

  setSelectedService: (service) => set({ selectedService: service }),
  setSelectedStaffId: (staffId) => set({ selectedStaffId: staffId }),
  setSelectedDate: (date) => set({ selectedDate: date, selectedSlot: null }),
  setSelectedSlot: (slot) => set({ selectedSlot: slot }),
  setCustomerInfo: (info) =>
    set((state) => ({
      customerInfo: { ...state.customerInfo, ...info },
    })),
  setCurrentStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 3) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
  reset: () =>
    set({
      selectedService: null,
      selectedStaffId: null,
      selectedDate: null,
      selectedSlot: null,
      customerInfo: { ...initialCustomerInfo },
      currentStep: 1,
    }),
}));
