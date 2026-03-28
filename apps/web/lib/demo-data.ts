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
  email: 'maria@demo.com',
  firstName: 'Maria',
  lastName: 'Santos',
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
    slug: string;
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
    name: 'Balayage Highlights',
    description: 'Premium balayage highlights with hand-painted technique. Includes consultation, color, toner, and blow-dry for a natural sun-kissed look.',
    category: 'Beauty',
    price: 2500,
    duration: 120,
    image: '/demo/beauty.jpg',
    provider: { id: 'demo-prov-001', name: 'Glow Up Studio', slug: 'glow-up-studio', avatar: '/demo/avatar-1.jpg', rating: 4.9, reviewCount: 87, address: '123 Jupiter St, Makati' },
    nextAvailable: 'Today, 3:00 PM',
  },
  {
    id: 'demo-svc-002',
    name: 'Hilot Traditional Massage',
    description: 'Traditional Filipino hilot massage using warm coconut oil and banana leaves for diagnosis. Relieves muscle tension and restores energy flow.',
    category: 'Wellness',
    price: 800,
    duration: 60,
    image: '/demo/wellness.jpg',
    provider: { id: 'demo-prov-002', name: 'Healing Hands Wellness', slug: 'healing-hands-wellness', avatar: '/demo/avatar-2.jpg', rating: 4.8, reviewCount: 95, address: 'BGC Stopover, Taguig' },
    nextAvailable: 'Tomorrow, 10:00 AM',
  },
  {
    id: 'demo-svc-003',
    name: 'Aircon Cleaning & Check',
    description: 'Full split-type aircon cleaning service. Includes disassembly, deep wash of filters and evaporator, drain flush, and performance check.',
    category: 'Home Services',
    price: 1500,
    duration: 90,
    image: '/demo/home-services.jpg',
    provider: { id: 'demo-prov-003', name: 'BreezePro Services', slug: 'breezepro-services', avatar: '/demo/avatar-3.jpg', rating: 4.7, reviewCount: 203, address: 'Shaw Blvd, Mandaluyong' },
    nextAvailable: 'Today, 9:00 AM',
  },
  {
    id: 'demo-svc-004',
    name: 'Lash Extensions',
    description: 'Classic or volume lash extensions applied strand by strand. Includes consultation, lash mapping, and aftercare kit.',
    category: 'Beauty',
    price: 1800,
    duration: 90,
    image: '/demo/facial.jpg',
    provider: { id: 'demo-prov-004', name: 'Flawless BGC', slug: 'flawless-bgc', avatar: '/demo/avatar-1.jpg', rating: 4.9, reviewCount: 76, address: 'High Street South, Taguig' },
    nextAvailable: 'Today, 2:00 PM',
  },
  {
    id: 'demo-svc-005',
    name: 'Personal Training',
    description: 'One-on-one personal training session tailored to your fitness goals. Equipment provided. All fitness levels welcome.',
    category: 'Fitness',
    price: 1000,
    duration: 60,
    image: '/demo/fitness.jpg',
    provider: { id: 'demo-prov-005', name: 'FitZone Eastwood', slug: 'fitzone-eastwood', avatar: '/demo/avatar-2.jpg', rating: 4.8, reviewCount: 64, address: 'Eastwood City, Quezon City' },
    nextAvailable: 'Today, 6:00 PM',
  },
  {
    id: 'demo-svc-006',
    name: 'Dog Grooming',
    description: 'Full grooming package for your furry friend. Bath, haircut, nail trim, and ear cleaning. Gentle handling guaranteed.',
    category: 'Pets',
    price: 900,
    duration: 90,
    image: '/demo/pets.jpg',
    provider: { id: 'demo-prov-006', name: 'Paw Spa', slug: 'paw-spa', avatar: '/demo/avatar-3.jpg', rating: 4.8, reviewCount: 167, address: 'Katipunan Ave, Quezon City' },
    nextAvailable: 'Today, 11:00 AM',
  },
  {
    id: 'demo-svc-007',
    name: 'Home Deep Cleaning',
    description: 'Professional deep cleaning for your entire home. Kitchen, bathrooms, bedrooms, and living areas. Eco-friendly products used.',
    category: 'Home Services',
    price: 3500,
    duration: 240,
    image: '/demo/home-services.jpg',
    provider: { id: 'demo-prov-007', name: 'Sparkle PH', slug: 'sparkle-ph', avatar: '/demo/avatar-1.jpg', rating: 4.7, reviewCount: 189, address: 'Ortigas Center, Pasig' },
    nextAvailable: 'Tomorrow, 8:00 AM',
  },
  {
    id: 'demo-svc-008',
    name: 'Nail Art Session',
    description: 'Custom nail art with gel polish. Includes nail prep, cuticle care, design consultation, and top coat for long-lasting wear.',
    category: 'Beauty',
    price: 600,
    duration: 45,
    image: '/demo/beauty.jpg',
    provider: { id: 'demo-prov-001', name: 'Glow Up Studio', slug: 'glow-up-studio', avatar: '/demo/avatar-1.jpg', rating: 4.9, reviewCount: 87, address: '123 Jupiter St, Makati' },
    nextAvailable: 'Tomorrow, 11:00 AM',
  },
  {
    id: 'demo-svc-009',
    name: 'Business Strategy Consult',
    description: 'Expert business strategy consultation. Review of current operations, growth planning, and actionable recommendations for Philippine SMEs.',
    category: 'Consulting',
    price: 5000,
    duration: 90,
    image: '/demo/consulting.jpg',
    provider: { id: 'demo-prov-008', name: 'Launchpad Advisors', slug: 'launchpad-advisors', avatar: '/demo/avatar-2.jpg', rating: 4.6, reviewCount: 42, address: 'Ayala Ave, Makati' },
    nextAvailable: 'Tomorrow, 2:00 PM',
  },
];

export const DEMO_BOOKINGS = [
  {
    id: 'demo-booking-001',
    serviceId: 'demo-svc-001',
    serviceName: 'Balayage Highlights',
    providerName: 'Glow Up Studio',
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    status: 'confirmed',
    price: 2500,
    durationMinutes: 120,
    accessToken: 'demo-token',
  },
  {
    id: 'demo-booking-002',
    serviceId: 'demo-svc-002',
    serviceName: 'Hilot Traditional Massage',
    providerName: 'Healing Hands Wellness',
    startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    status: 'pending',
    price: 800,
    durationMinutes: 60,
    accessToken: 'demo-token',
  },
  {
    id: 'demo-booking-003',
    serviceId: 'demo-svc-007',
    serviceName: 'Home Deep Cleaning',
    providerName: 'Sparkle PH',
    startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    price: 3500,
    durationMinutes: 240,
    accessToken: 'demo-token',
  },
  {
    id: 'demo-booking-004',
    serviceId: 'demo-svc-005',
    serviceName: 'Personal Training',
    providerName: 'FitZone Eastwood',
    startTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    status: 'completed',
    price: 1000,
    durationMinutes: 60,
    accessToken: 'demo-token',
  },
];

export const DEMO_REVIEWS = [
  {
    id: 'demo-review-001',
    reviewerName: 'Maria Santos',
    rating: 5,
    comment: 'Absolutely amazing balayage! The color came out so natural. Will definitely book again at Glow Up Studio.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-review-002',
    reviewerName: 'Carlo Reyes',
    rating: 4,
    comment: 'Great experience overall. The studio was clean and welcoming. Slight wait time but the result was worth it.',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-review-003',
    reviewerName: 'Ana Lim',
    rating: 5,
    comment: 'The hilot massage was exactly what I needed. Traditional technique with a modern touch. Highly recommend!',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-review-004',
    reviewerName: 'Mark Torres',
    rating: 5,
    comment: 'Best lash extensions in BGC! The team at Flawless is friendly and skilled. Very reasonable price too.',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-review-005',
    reviewerName: 'Sofia Garcia',
    rating: 4,
    comment: 'Good value for money. Professional aircon cleaning service and very punctual.',
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
