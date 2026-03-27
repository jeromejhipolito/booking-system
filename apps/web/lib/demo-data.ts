export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export function getDemoRole(): 'customer' | 'provider' {
  if (typeof window === 'undefined') return 'customer';
  return (localStorage.getItem('demo-role') as 'customer' | 'provider') || 'customer';
}

export function setDemoRole(role: 'customer' | 'provider') {
  if (typeof window !== 'undefined') {
    localStorage.setItem('demo-role', role);
  }
}

export const DEMO_USER = {
  id: 'demo-user-001',
  email: 'jane@demo.com',
  firstName: 'Jane',
  lastName: 'Doe',
  role: 'customer' as const,
  isActive: true,
  createdAt: '2026-01-15T00:00:00Z',
  updatedAt: '2026-01-15T00:00:00Z',
};

export const DEMO_PROVIDER_USER = {
  id: 'demo-provider-001',
  email: 'elena@demo.com',
  firstName: 'Elena',
  lastName: 'Santos',
  role: 'provider' as const,
  isActive: true,
  createdAt: '2025-06-01T00:00:00Z',
  updatedAt: '2025-06-01T00:00:00Z',
};

export const DEMO_TOKEN = 'demo-jwt-token-for-portfolio-showcase';

export interface DemoService {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  image: string;
  provider: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    reviewCount: number;
    address: string;
  };
  nextAvailable: string;
}

export const DEMO_SERVICES: DemoService[] = [
  {
    id: 'demo-svc-001',
    name: 'Haircut & Styling',
    description: 'Professional haircut and styling by experienced stylists. Includes consultation, wash, cut, and blow-dry for a fresh new look.',
    category: 'Beauty',
    price: 45,
    duration: 60,
    image: '/demo/beauty.jpg',
    provider: { id: 'demo-prov-001', name: "Elena's Salon", avatar: '/demo/avatar-1.jpg', rating: 4.9, reviewCount: 128, address: '123 Rizal St, Makati City' },
    nextAvailable: 'Today, 2:00 PM',
  },
  {
    id: 'demo-svc-002',
    name: 'Deep Tissue Massage',
    description: 'Therapeutic deep tissue massage to relieve muscle tension and promote relaxation. Perfect for stress relief and recovery.',
    category: 'Wellness',
    price: 85,
    duration: 60,
    image: '/demo/wellness.jpg',
    provider: { id: 'demo-prov-002', name: 'Zen Wellness Center', avatar: '/demo/avatar-2.jpg', rating: 4.8, reviewCount: 95, address: '456 Ayala Ave, BGC, Taguig' },
    nextAvailable: 'Tomorrow, 10:00 AM',
  },
  {
    id: 'demo-svc-003',
    name: 'House Cleaning',
    description: 'Professional deep house cleaning service. Includes kitchen, bathrooms, bedrooms, and living areas. Eco-friendly products.',
    category: 'Home Services',
    price: 120,
    duration: 180,
    image: '/demo/home-services.jpg',
    provider: { id: 'demo-prov-003', name: 'SparkleClean Co.', avatar: '/demo/avatar-3.jpg', rating: 4.7, reviewCount: 203, address: '789 Ortigas Center, Pasig' },
    nextAvailable: 'Today, 9:00 AM',
  },
  {
    id: 'demo-svc-004',
    name: 'Personal Training Session',
    description: 'One-on-one personal training session tailored to your fitness goals. Equipment provided. All fitness levels welcome.',
    category: 'Fitness',
    price: 65,
    duration: 60,
    image: '/demo/fitness.jpg',
    provider: { id: 'demo-prov-004', name: 'FitPro Studio', avatar: '/demo/avatar-1.jpg', rating: 4.9, reviewCount: 76, address: '321 Bonifacio High Street, BGC' },
    nextAvailable: 'Today, 6:00 PM',
  },
  {
    id: 'demo-svc-005',
    name: 'Business Strategy Consultation',
    description: 'Expert business strategy consultation. Review of current operations, growth planning, and actionable recommendations.',
    category: 'Consulting',
    price: 150,
    duration: 90,
    image: '/demo/consulting.jpg',
    provider: { id: 'demo-prov-005', name: 'Growth Advisors', avatar: '/demo/avatar-2.jpg', rating: 4.6, reviewCount: 42, address: '55 Jupiter St, Bel-Air, Makati' },
    nextAvailable: 'Tomorrow, 2:00 PM',
  },
  {
    id: 'demo-svc-006',
    name: 'Dog Grooming',
    description: 'Full grooming package for your furry friend. Bath, haircut, nail trim, and ear cleaning. Gentle handling guaranteed.',
    category: 'Pets',
    price: 55,
    duration: 90,
    image: '/demo/pets.jpg',
    provider: { id: 'demo-prov-006', name: 'Paws & Claws', avatar: '/demo/avatar-3.jpg', rating: 4.8, reviewCount: 167, address: '88 Katipunan Ave, Quezon City' },
    nextAvailable: 'Today, 11:00 AM',
  },
  {
    id: 'demo-svc-007',
    name: 'Facial Treatment',
    description: 'Luxurious facial treatment with deep cleansing, exfoliation, and hydrating mask. Glow from the inside out.',
    category: 'Beauty',
    price: 75,
    duration: 75,
    image: '/demo/facial.jpg',
    provider: { id: 'demo-prov-001', name: "Elena's Salon", avatar: '/demo/avatar-1.jpg', rating: 4.9, reviewCount: 128, address: '123 Rizal St, Makati City' },
    nextAvailable: 'Tomorrow, 11:00 AM',
  },
  {
    id: 'demo-svc-008',
    name: 'Yoga Class',
    description: 'Guided yoga session for all levels. Focus on flexibility, strength, and mindfulness. Mats and props provided.',
    category: 'Fitness',
    price: 25,
    duration: 60,
    image: '/demo/yoga.jpg',
    provider: { id: 'demo-prov-007', name: 'Namaste Studio', avatar: '/demo/avatar-2.jpg', rating: 4.7, reviewCount: 89, address: '12 Zen Lane, Alabang, Muntinlupa' },
    nextAvailable: 'Today, 7:00 AM',
  },
  {
    id: 'demo-svc-009',
    name: 'Plumbing Repair',
    description: 'Professional plumbing repair service. Fixing leaks, clogs, and installations. Licensed and insured.',
    category: 'Home Services',
    price: 95,
    duration: 120,
    image: '/demo/plumbing.jpg',
    provider: { id: 'demo-prov-008', name: 'QuickFix Plumbing', avatar: '/demo/avatar-3.jpg', rating: 4.5, reviewCount: 134, address: '77 Shaw Blvd, Mandaluyong' },
    nextAvailable: 'Tomorrow, 8:00 AM',
  },
];

export const DEMO_BOOKINGS = [
  {
    id: 'demo-booking-001',
    serviceId: 'demo-svc-001',
    serviceName: 'Haircut & Styling',
    providerName: "Elena's Salon",
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    status: 'confirmed',
    price: 45,
    durationMinutes: 60,
    accessToken: 'demo-token',
  },
  {
    id: 'demo-booking-002',
    serviceId: 'demo-svc-002',
    serviceName: 'Deep Tissue Massage',
    providerName: 'Zen Wellness Center',
    startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    status: 'pending',
    price: 85,
    durationMinutes: 60,
    accessToken: 'demo-token',
  },
  {
    id: 'demo-booking-003',
    serviceId: 'demo-svc-003',
    serviceName: 'House Cleaning',
    providerName: 'SparkleClean Co.',
    startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    price: 120,
    durationMinutes: 180,
    accessToken: 'demo-token',
  },
  {
    id: 'demo-booking-004',
    serviceId: 'demo-svc-004',
    serviceName: 'Personal Training Session',
    providerName: 'FitPro Studio',
    startTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    status: 'completed',
    price: 65,
    durationMinutes: 60,
    accessToken: 'demo-token',
  },
];

export const DEMO_REVIEWS = [
  {
    id: 'demo-review-001',
    reviewerName: 'Maria S.',
    rating: 5,
    comment: 'Absolutely amazing service! Elena was so professional and my hair looks incredible. Will definitely book again.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-review-002',
    reviewerName: 'Carlo R.',
    rating: 4,
    comment: 'Great experience overall. The salon was clean and welcoming. Slight wait time but the result was worth it.',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-review-003',
    reviewerName: 'Ana L.',
    rating: 5,
    comment: 'Perfect haircut, exactly what I wanted. The consultation before the cut really helped.',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-review-004',
    reviewerName: 'Mark T.',
    rating: 5,
    comment: 'Best salon in Makati! The team is friendly and skilled. Highly recommend the styling package.',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-review-005',
    reviewerName: 'Sofia G.',
    rating: 4,
    comment: 'Good value for money. Professional service and convenient location.',
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
