// ========== TYPES ==========
export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number; // minutes
  provider: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    reviewCount: number;
    address?: string;
  };
  nextAvailable: string;
  image: string;
}

export interface TimeSlot {
  id: string;
  startTime: string; // "09:00"
  endTime: string;   // "09:30"
  available: boolean;
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  providerName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  price: number;
  notes: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  avatar: string;
  specialties: string[];
}

// ========== CATEGORIES ==========
export const CATEGORIES = [
  'All',
  'Beauty',
  'Wellness',
  'Home Services',
  'Fitness',
  'Consulting',
  'Pets',
] as const;

// ========== MOCK SERVICES ==========
export const MOCK_SERVICES: Service[] = [
  {
    id: 'svc-001',
    name: 'Haircut & Styling',
    description: 'Professional haircut and styling by experienced stylists. Includes consultation, wash, cut, and blow-dry.',
    category: 'Beauty',
    price: 45,
    duration: 60,
    provider: { id: 'prov-001', name: 'Elena\'s Salon', avatar: '/avatars/elena.jpg', rating: 4.9, reviewCount: 128, address: '123 Rizal St, Makati City' },
    nextAvailable: 'Today, 2:00 PM',
    image: '/services/haircut.jpg',
  },
  {
    id: 'svc-002',
    name: 'Deep Tissue Massage',
    description: 'Therapeutic deep tissue massage to relieve muscle tension and promote relaxation. 60-minute session.',
    category: 'Wellness',
    price: 85,
    duration: 60,
    provider: { id: 'prov-002', name: 'Zen Wellness Center', avatar: '/avatars/zen.jpg', rating: 4.8, reviewCount: 95, address: '456 Ayala Ave, BGC, Taguig' },
    nextAvailable: 'Tomorrow, 10:00 AM',
    image: '/services/massage.jpg',
  },
  {
    id: 'svc-003',
    name: 'House Cleaning',
    description: 'Professional deep house cleaning service. Includes kitchen, bathrooms, bedrooms, and living areas.',
    category: 'Home Services',
    price: 120,
    duration: 180,
    provider: { id: 'prov-003', name: 'SparkleClean Co.', avatar: '/avatars/sparkle.jpg', rating: 4.7, reviewCount: 203, address: '789 Ortigas Center, Pasig' },
    nextAvailable: 'Today, 9:00 AM',
    image: '/services/cleaning.jpg',
  },
  {
    id: 'svc-004',
    name: 'Personal Training Session',
    description: 'One-on-one personal training session tailored to your fitness goals. Equipment provided.',
    category: 'Fitness',
    price: 65,
    duration: 60,
    provider: { id: 'prov-004', name: 'FitPro Studio', avatar: '/avatars/fitpro.jpg', rating: 4.9, reviewCount: 76, address: '321 Bonifacio High Street, BGC' },
    nextAvailable: 'Today, 6:00 PM',
    image: '/services/training.jpg',
  },
  {
    id: 'svc-005',
    name: 'Business Strategy Consultation',
    description: 'Expert business strategy consultation. Review of current operations and growth planning.',
    category: 'Consulting',
    price: 150,
    duration: 90,
    provider: { id: 'prov-005', name: 'Growth Advisors', avatar: '/avatars/growth.jpg', rating: 4.6, reviewCount: 42, address: '55 Jupiter St, Bel-Air, Makati' },
    nextAvailable: 'Tomorrow, 2:00 PM',
    image: '/services/consulting.jpg',
  },
  {
    id: 'svc-006',
    name: 'Dog Grooming',
    description: 'Full grooming package for your furry friend. Bath, haircut, nail trim, and ear cleaning.',
    category: 'Pets',
    price: 55,
    duration: 90,
    provider: { id: 'prov-006', name: 'Paws & Claws', avatar: '/avatars/paws.jpg', rating: 4.8, reviewCount: 167, address: '88 Katipunan Ave, Quezon City' },
    nextAvailable: 'Today, 11:00 AM',
    image: '/services/grooming.jpg',
  },
  {
    id: 'svc-007',
    name: 'Facial Treatment',
    description: 'Luxurious facial treatment with deep cleansing, exfoliation, and hydrating mask.',
    category: 'Beauty',
    price: 75,
    duration: 75,
    provider: { id: 'prov-001', name: 'Elena\'s Salon', avatar: '/avatars/elena.jpg', rating: 4.9, reviewCount: 128, address: '123 Rizal St, Makati City' },
    nextAvailable: 'Tomorrow, 11:00 AM',
    image: '/services/facial.jpg',
  },
  {
    id: 'svc-008',
    name: 'Yoga Class',
    description: 'Guided yoga session for all levels. Focus on flexibility, strength, and mindfulness.',
    category: 'Fitness',
    price: 25,
    duration: 60,
    provider: { id: 'prov-007', name: 'Namaste Studio', avatar: '/avatars/namaste.jpg', rating: 4.7, reviewCount: 89, address: '12 Zen Lane, Alabang, Muntinlupa' },
    nextAvailable: 'Today, 7:00 AM',
    image: '/services/yoga.jpg',
  },
  {
    id: 'svc-009',
    name: 'Plumbing Repair',
    description: 'Professional plumbing repair service. Fixing leaks, clogs, and installations.',
    category: 'Home Services',
    price: 95,
    duration: 120,
    provider: { id: 'prov-008', name: 'QuickFix Plumbing', avatar: '/avatars/quickfix.jpg', rating: 4.5, reviewCount: 134, address: '77 Shaw Blvd, Mandaluyong' },
    nextAvailable: 'Tomorrow, 8:00 AM',
    image: '/services/plumbing.jpg',
  },
];

// ========== MOCK TIME SLOTS ==========
export const MOCK_SLOTS: TimeSlot[] = [
  { id: 'slot-01', startTime: '09:00', endTime: '09:30', available: true },
  { id: 'slot-02', startTime: '09:30', endTime: '10:00', available: true },
  { id: 'slot-03', startTime: '10:00', endTime: '10:30', available: false },
  { id: 'slot-04', startTime: '10:30', endTime: '11:00', available: true },
  { id: 'slot-05', startTime: '11:00', endTime: '11:30', available: true },
  { id: 'slot-06', startTime: '11:30', endTime: '12:00', available: false },
  { id: 'slot-07', startTime: '13:00', endTime: '13:30', available: true },
  { id: 'slot-08', startTime: '13:30', endTime: '14:00', available: true },
  { id: 'slot-09', startTime: '14:00', endTime: '14:30', available: true },
  { id: 'slot-10', startTime: '14:30', endTime: '15:00', available: false },
  { id: 'slot-11', startTime: '15:00', endTime: '15:30', available: true },
  { id: 'slot-12', startTime: '15:30', endTime: '16:00', available: true },
  { id: 'slot-13', startTime: '16:00', endTime: '16:30', available: true },
  { id: 'slot-14', startTime: '16:30', endTime: '17:00', available: false },
  { id: 'slot-15', startTime: '17:00', endTime: '17:30', available: true },
  { id: 'slot-16', startTime: '17:30', endTime: '18:00', available: true },
];

// ========== MOCK BOOKINGS ==========
export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'bk-001',
    serviceId: 'svc-001',
    serviceName: 'Haircut & Styling',
    providerName: 'Elena\'s Salon',
    customerName: 'Alice Johnson',
    customerEmail: 'alice@example.com',
    customerPhone: '(555) 123-4567',
    date: '2026-03-27',
    startTime: '10:00',
    endTime: '11:00',
    status: 'confirmed',
    price: 45,
    notes: 'First time customer, wants a trim',
  },
  {
    id: 'bk-002',
    serviceId: 'svc-002',
    serviceName: 'Deep Tissue Massage',
    providerName: 'Zen Wellness Center',
    customerName: 'Bob Smith',
    customerEmail: 'bob@example.com',
    customerPhone: '(555) 234-5678',
    date: '2026-03-26',
    startTime: '14:00',
    endTime: '15:00',
    status: 'confirmed',
    price: 85,
    notes: 'Focus on lower back',
  },
  {
    id: 'bk-003',
    serviceId: 'svc-004',
    serviceName: 'Personal Training Session',
    providerName: 'FitPro Studio',
    customerName: 'Carol Davis',
    customerEmail: 'carol@example.com',
    customerPhone: '(555) 345-6789',
    date: '2026-03-25',
    startTime: '18:00',
    endTime: '19:00',
    status: 'completed',
    price: 65,
    notes: 'Weight training focus',
  },
  {
    id: 'bk-004',
    serviceId: 'svc-003',
    serviceName: 'House Cleaning',
    providerName: 'SparkleClean Co.',
    customerName: 'David Lee',
    customerEmail: 'david@example.com',
    customerPhone: '(555) 456-7890',
    date: '2026-03-28',
    startTime: '09:00',
    endTime: '12:00',
    status: 'pending',
    price: 120,
    notes: '3-bedroom apartment',
  },
  {
    id: 'bk-005',
    serviceId: 'svc-006',
    serviceName: 'Dog Grooming',
    providerName: 'Paws & Claws',
    customerName: 'Emma Wilson',
    customerEmail: 'emma@example.com',
    customerPhone: '(555) 567-8901',
    date: '2026-03-20',
    startTime: '11:00',
    endTime: '12:30',
    status: 'completed',
    price: 55,
    notes: 'Golden retriever, full groom',
  },
  {
    id: 'bk-006',
    serviceId: 'svc-005',
    serviceName: 'Business Strategy Consultation',
    providerName: 'Growth Advisors',
    customerName: 'Frank Moore',
    customerEmail: 'frank@example.com',
    customerPhone: '(555) 678-9012',
    date: '2026-03-22',
    startTime: '14:00',
    endTime: '15:30',
    status: 'cancelled',
    price: 150,
    notes: 'Startup growth strategy',
  },
];

// ========== MOCK STAFF ==========
export const MOCK_STAFF: Staff[] = [
  { id: 'staff-001', name: 'Sarah Martinez', role: 'Senior Stylist', avatar: '/avatars/sarah.jpg', specialties: ['Coloring', 'Cuts', 'Styling'] },
  { id: 'staff-002', name: 'James Chen', role: 'Massage Therapist', avatar: '/avatars/james.jpg', specialties: ['Deep Tissue', 'Swedish', 'Sports'] },
  { id: 'staff-003', name: 'Maria Garcia', role: 'Esthetician', avatar: '/avatars/maria.jpg', specialties: ['Facials', 'Skincare', 'Waxing'] },
  { id: 'staff-004', name: 'Mike Thompson', role: 'Personal Trainer', avatar: '/avatars/mike.jpg', specialties: ['Weight Training', 'HIIT', 'Nutrition'] },
];

// ========== HELPER ==========
export function withDelay<T>(data: T, ms: number = 500): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), ms);
  });
}

export function getSlotsByPeriod(slots: TimeSlot[]) {
  const morning = slots.filter(s => {
    const hour = parseInt(s.startTime.split(':')[0]);
    return hour >= 9 && hour < 12;
  });
  const afternoon = slots.filter(s => {
    const hour = parseInt(s.startTime.split(':')[0]);
    return hour >= 12 && hour < 17;
  });
  const evening = slots.filter(s => {
    const hour = parseInt(s.startTime.split(':')[0]);
    return hour >= 17;
  });
  return { morning, afternoon, evening };
}
