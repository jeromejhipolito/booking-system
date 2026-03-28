'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useBookingStore } from '@/stores/booking-store';
import { MOCK_SERVICES, MOCK_STAFF } from '@/lib/mock-data';
import { DEMO_MODE, DEMO_SERVICES } from '@/lib/demo-data';
import { api } from '@/lib/api-client';

export default function ServiceStep() {
  const searchParams = useSearchParams();
  const { selectedService, selectedStaffId, setSelectedService, setSelectedStaffId, nextStep } =
    useBookingStore();

  const [selectedStaff, setSelectedStaff] = useState<string | null>(selectedStaffId);
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadServices() {
      if (DEMO_MODE) {
        setServices(DEMO_SERVICES);
        setIsLoading(false);
        return;
      }
      try {
        const result: any = await api.getServices();
        const data = result?.data || result || [];
        if (data.length > 0) {
          setServices(data.map((s: any) => ({
            id: s.id,
            name: s.name,
            description: s.description || '',
            category: s.serviceType || 'Service',
            price: s.price || 0,
            duration: s.durationMinutes || 60,
            image: '',
            provider: {
              id: s.providerId || s.provider?.id || '',
              name: s.provider?.businessName || s.providerName || 'Provider',
              avatar: '',
              rating: 0,
              reviewCount: 0,
              address: s.provider?.address || '',
            },
            nextAvailable: '',
          })));
        } else {
          setServices([]);
        }
      } catch {
        setServices([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadServices();
  }, []);

  // Auto-select from query param
  useEffect(() => {
    if (services.length === 0 || selectedService) return;
    const serviceId = searchParams.get('serviceId');
    if (serviceId) {
      const service = services.find((s) => s.id === serviceId);
      if (service) {
        setSelectedService(service);
      }
    }
  }, [searchParams, selectedService, setSelectedService, services]);

  const handleServiceSelect = (service: typeof MOCK_SERVICES[0]) => {
    setSelectedService(service);
    setSelectedStaff(null);
    setSelectedStaffId(null);
  };

  const handleStaffSelect = (staffId: string) => {
    setSelectedStaff(staffId);
    setSelectedStaffId(staffId);
  };

  const handleContinue = () => {
    if (selectedService) {
      nextStep();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-muted-200 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl border border-muted-200 animate-pulse">
              <div className="h-4 bg-muted-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-muted-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-muted-900 mb-1">Select a Service</h2>
      <p className="text-sm text-muted-500 mb-6">Choose the service you would like to book</p>

      {services.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-500 mb-2">No services available</p>
          <p className="text-sm text-muted-400">Services will appear here once providers set them up.</p>
        </div>
      )}

      {/* Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => handleServiceSelect(service)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              selectedService?.id === service.id
                ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600'
                : 'border-muted-200 hover:border-muted-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-medium text-primary-600">{service.category}</span>
                <h3 className="font-semibold text-muted-900 mt-1">{service.name}</h3>
                <p className="text-sm text-muted-500 mt-1">{service.provider.name}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-muted-900">₱{service.price.toLocaleString()}</p>
                <p className="text-xs text-muted-400">{service.duration}min</p>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 text-primary-700">New</span>
            </div>
          </button>
        ))}
      </div>

      {/* Staff Selector */}
      {selectedService && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-muted-900 mb-1">Choose a Staff Member</h3>
          <p className="text-sm text-muted-500 mb-4">Optional - or we&apos;ll assign the best available</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {MOCK_STAFF.map((staff) => (
              <button
                key={staff.id}
                onClick={() => handleStaffSelect(staff.id)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  selectedStaff === staff.id
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-muted-200 hover:border-muted-300'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold mx-auto mb-2">
                  {staff.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <p className="text-sm font-medium text-muted-900">{staff.name}</p>
                <p className="text-xs text-muted-500">{staff.role}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-end">
        <button
          onClick={handleContinue}
          disabled={!selectedService}
          className="btn-primary disabled:opacity-50"
        >
          Continue to Date &amp; Time
        </button>
      </div>
    </div>
  );
}
