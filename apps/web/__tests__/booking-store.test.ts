import { describe, it, expect, beforeEach } from 'vitest';
import { useBookingStore } from '@/stores/booking-store';
import type { Service, TimeSlot } from '@/lib/mock-data';

const mockService: Service = {
  id: 'svc-test',
  name: 'Test Service',
  description: 'A test service',
  category: 'Beauty',
  price: 50,
  duration: 60,
  provider: {
    id: 'prov-test',
    name: 'Test Provider',
    avatar: '/test.jpg',
    rating: 4.5,
    reviewCount: 10,
  },
  nextAvailable: 'Today, 10:00 AM',
  image: '/test-service.jpg',
};

const mockSlot: TimeSlot = {
  id: 'slot-test',
  startTime: '10:00',
  endTime: '10:30',
  available: true,
};

describe('Booking Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useBookingStore.getState().reset();
  });

  it('setSelectedService updates selectedService', () => {
    const store = useBookingStore.getState();
    expect(store.selectedService).toBeNull();

    useBookingStore.getState().setSelectedService(mockService);
    expect(useBookingStore.getState().selectedService).toEqual(mockService);
  });

  it('setSelectedSlot updates selectedSlot', () => {
    const store = useBookingStore.getState();
    expect(store.selectedSlot).toBeNull();

    useBookingStore.getState().setSelectedSlot(mockSlot);
    expect(useBookingStore.getState().selectedSlot).toEqual(mockSlot);
  });

  it('reset clears all state', () => {
    // Set some state (setSelectedDate must be called BEFORE setSelectedSlot
    // because setSelectedDate clears selectedSlot by design)
    useBookingStore.getState().setSelectedService(mockService);
    useBookingStore.getState().setCurrentStep(3);
    useBookingStore.getState().setSelectedDate('2026-04-01');
    useBookingStore.getState().setSelectedSlot(mockSlot);
    useBookingStore.getState().setCustomerInfo({ name: 'John', email: 'john@test.com' });

    // Verify state was set
    expect(useBookingStore.getState().selectedService).not.toBeNull();
    expect(useBookingStore.getState().selectedSlot).not.toBeNull();
    expect(useBookingStore.getState().currentStep).toBe(3);

    // Reset
    useBookingStore.getState().reset();

    // Verify everything is cleared
    const state = useBookingStore.getState();
    expect(state.selectedService).toBeNull();
    expect(state.selectedStaffId).toBeNull();
    expect(state.selectedDate).toBeNull();
    expect(state.selectedSlot).toBeNull();
    expect(state.customerInfo).toEqual({
      name: '',
      email: '',
      phone: '',
      notes: '',
    });
    expect(state.currentStep).toBe(1);
  });

  it('setCurrentStep updates currentStep', () => {
    expect(useBookingStore.getState().currentStep).toBe(1);

    useBookingStore.getState().setCurrentStep(2);
    expect(useBookingStore.getState().currentStep).toBe(2);

    useBookingStore.getState().setCurrentStep(3);
    expect(useBookingStore.getState().currentStep).toBe(3);
  });

  it('setSelectedDate clears selectedSlot', () => {
    useBookingStore.getState().setSelectedDate('2026-04-01');
    useBookingStore.getState().setSelectedSlot(mockSlot);
    expect(useBookingStore.getState().selectedSlot).not.toBeNull();

    useBookingStore.getState().setSelectedDate('2026-04-02');
    expect(useBookingStore.getState().selectedSlot).toBeNull();
  });

  it('nextStep caps at 3', () => {
    useBookingStore.getState().setCurrentStep(3);
    useBookingStore.getState().nextStep();
    expect(useBookingStore.getState().currentStep).toBe(3);
  });

  it('prevStep caps at 1', () => {
    useBookingStore.getState().setCurrentStep(1);
    useBookingStore.getState().prevStep();
    expect(useBookingStore.getState().currentStep).toBe(1);
  });

  it('setCustomerInfo merges partial updates', () => {
    useBookingStore.getState().setCustomerInfo({ name: 'John' });
    useBookingStore.getState().setCustomerInfo({ email: 'john@test.com' });

    const info = useBookingStore.getState().customerInfo;
    expect(info.name).toBe('John');
    expect(info.email).toBe('john@test.com');
  });

  it('full wizard flow preserves all data', () => {
    const store = useBookingStore.getState();
    store.setSelectedService(mockService);
    store.setSelectedDate('2026-04-01');
    store.setSelectedSlot(mockSlot);
    store.setCustomerInfo({ name: 'Jane', email: 'jane@test.com', phone: '+63917', notes: 'Test' });
    store.setCurrentStep(3);

    const state = useBookingStore.getState();
    expect(state.selectedService).toEqual(mockService);
    expect(state.selectedDate).toBe('2026-04-01');
    expect(state.selectedSlot).toEqual(mockSlot);
    expect(state.customerInfo.name).toBe('Jane');
    expect(state.currentStep).toBe(3);
  });
});
