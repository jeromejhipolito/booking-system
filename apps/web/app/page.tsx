import Link from 'next/link';
import { MOCK_SERVICES } from '@/lib/mock-data';
import { DEMO_MODE, DEMO_SERVICES } from '@/lib/demo-data';

const CATEGORY_GRADIENTS: Record<string, string> = {
  'Beauty': 'bg-gradient-to-br from-primary-100 via-rose-50 to-pink-50',
  'Wellness': 'bg-gradient-to-br from-primary-50 via-amber-50 to-orange-50',
  'Home Services': 'bg-gradient-to-br from-primary-100 via-primary-50 to-orange-50',
  'Fitness': 'bg-gradient-to-br from-primary-50 via-red-50 to-rose-50',
  'Consulting': 'bg-gradient-to-br from-primary-50 via-stone-100 to-warm-gray-50',
  'Pets': 'bg-gradient-to-br from-amber-50 via-primary-50 to-yellow-50',
};

const CATEGORY_ICONS: Record<string, string> = {
  'Beauty': '✂',
  'Wellness': '◉',
  'Home Services': '⌂',
  'Fitness': '⚡',
  'Consulting': '◈',
  'Pets': '🐾',
};

const STATS = [
  { label: 'Active Providers', value: '2,500+' },
  { label: 'Bookings Made', value: '150K+' },
  { label: 'Happy Customers', value: '50K+' },
  { label: 'Service Categories', value: '25+' },
];

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Browse Services',
    description: 'Explore a wide range of services from top-rated providers in your area.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    step: '2',
    title: 'Pick a Time',
    description: 'Choose a date and time that works for you. Real-time availability updates.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    step: '3',
    title: 'Book & Confirm',
    description: 'Confirm your booking instantly. Get reminders and manage appointments easily.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function HomePage() {
  const featuredServices = DEMO_MODE ? DEMO_SERVICES.slice(0, 6) : [];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-800 to-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        {/* Radial glow for depth */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 right-0 w-[32rem] h-[32rem] bg-accent-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-36">
          <div className="max-w-3xl">
            {/* Eyebrow label */}
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent-400 uppercase tracking-widest mb-6">
              <span className="w-8 h-px bg-accent-400" />
              Trusted by 50,000+ customers
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
              Book appointments with the{' '}
              <span className="text-accent-400">best professionals</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-primary-200 max-w-2xl leading-relaxed">
              Discover and book top-rated service providers in your area. From beauty to home services, find the perfect appointment in seconds.
            </p>
            {/* Hero Search Bar */}
            <div className="mt-10 max-w-xl">
              <form action="/services" className="relative">
                <div className="flex items-center bg-white rounded-xl shadow-lg shadow-primary-900/30 overflow-hidden">
                  <div className="pl-4">
                    <svg className="w-5 h-5 text-muted-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    name="q"
                    type="text"
                    placeholder="Search haircuts, massage, cleaning..."
                    className="flex-1 px-3 py-4 text-muted-900 placeholder-muted-400 focus:outline-none text-base"
                  />
                  <button type="submit" className="px-6 py-4 bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors">
                    Search
                  </button>
                </div>
              </form>
              {/* Quick category chips */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-primary-300">Popular:</span>
                {['Beauty', 'Wellness', 'Fitness', 'Home Services'].map((cat) => (
                  <Link
                    key={cat}
                    href={`/services?category=${cat}`}
                    className="text-sm px-3 py-1 rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors border border-white/10"
                  >
                    {CATEGORY_ICONS[cat]} {cat}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-all duration-200 shadow-lg shadow-primary-900/30 hover:shadow-xl hover:-translate-y-0.5"
              >
                Browse All Services
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-3.5 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-white/60 transition-all duration-200"
              >
                List Your Business
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gradient-to-b from-primary-900 to-primary-950 border-b border-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center px-4 py-6 rounded-xl bg-white/5 border border-white/10">
                <div className="text-4xl font-bold text-white">{stat.value}</div>
                <div className="mt-2 text-sm font-medium text-primary-300 uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      {featuredServices.length > 0 && <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-accent-500 uppercase tracking-widest">Hand-picked for you</span>
            <h2 className="mt-2 text-3xl font-bold text-muted-900">Featured Services</h2>
            <p className="mt-3 text-muted-500 max-w-2xl mx-auto">
              Popular services from our top-rated providers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.map((service) => (
              <Link key={service.id} href={`/services/${service.id}`} className="card-interactive overflow-hidden group flex flex-col">
                {/* Service image or gradient placeholder */}
                <div className={`relative h-44 ${CATEGORY_GRADIENTS[service.category] || 'bg-gradient-to-br from-muted-200 to-muted-300'}`}>
                  {service.image && <img src={service.image} alt={service.name} className="absolute inset-0 w-full h-full object-cover" />}
                  <div className="absolute inset-0 bg-black/5" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 text-xs font-semibold bg-white/90 backdrop-blur-sm text-muted-700 rounded-full shadow-sm">
                      {CATEGORY_ICONS[service.category] || '✦'} {service.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 text-white/90 text-xs font-medium bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                    {service.duration}min
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-semibold text-muted-900 group-hover:text-primary-600 transition-colors leading-snug">{service.name}</h3>
                  <p className="mt-1.5 text-sm text-muted-500 line-clamp-2 leading-relaxed flex-1">{service.description}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
                        {service.provider.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-muted-900 truncate">{service.provider.name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-500">
                          <span className="text-yellow-400">★</span>
                          <span className="font-medium text-muted-700">{service.provider.rating}</span>
                          <span>({service.provider.reviewCount})</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-muted-900">${service.price}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/services" className="inline-flex items-center gap-2 btn-primary shadow-md shadow-primary-600/20 hover:shadow-lg hover:shadow-primary-600/25 hover:-translate-y-0.5 transition-all duration-200">
              View All Services
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>}

      {/* How It Works */}
      <section id="how-it-works" className="bg-muted-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-accent-500 uppercase tracking-widest">Simple process</span>
            <h2 className="mt-2 text-3xl font-bold text-muted-900">How It Works</h2>
            <p className="mt-3 text-muted-500 max-w-md mx-auto">Book your next appointment in three easy steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line — desktop only */}
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200" />
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="relative text-center group">
                {/* Step number watermark */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-7xl font-black text-primary-50 select-none pointer-events-none leading-none">
                  {item.step}
                </div>
                <div className="relative mx-auto w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-primary-500/25 group-hover:shadow-xl group-hover:shadow-primary-500/30 group-hover:scale-105 transition-all duration-200">
                  {item.icon}
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-accent-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-muted-900">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-500 leading-relaxed max-w-xs mx-auto">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Provider CTA */}
      <section className="relative bg-gradient-to-br from-muted-900 via-primary-950 to-muted-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="absolute top-0 right-0 w-[28rem] h-[28rem] bg-primary-600/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block text-xs font-bold text-accent-400 uppercase tracking-widest mb-4">For Professionals</span>
          <h2 className="text-3xl sm:text-4xl font-bold">Are you a service provider?</h2>
          <p className="mt-4 text-muted-300 max-w-2xl mx-auto leading-relaxed">
            Join thousands of providers who use BookIt to grow their business. Set up your profile, manage bookings, and reach new customers.
          </p>
          <Link
            href="/register?role=provider"
            className="mt-10 inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-lg shadow-primary-900/40 hover:shadow-xl hover:-translate-y-0.5"
          >
            Get Started as a Provider
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-muted-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-sm font-semibold text-muted-900 mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/services" className="text-sm text-muted-500 hover:text-muted-700">Browse Services</Link></li>
                <li><Link href="/#how-it-works" className="text-sm text-muted-500 hover:text-muted-700">How It Works</Link></li>
                <li><Link href="/register" className="text-sm text-muted-500 hover:text-muted-700">For Providers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-muted-900 mb-4">Company</h4>
              <ul className="space-y-2">
                <li><span className="text-sm text-muted-500">About Us</span></li>
                <li><span className="text-sm text-muted-500">Careers</span></li>
                <li><span className="text-sm text-muted-500">Blog</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-muted-900 mb-4">Support</h4>
              <ul className="space-y-2">
                <li><span className="text-sm text-muted-500">Help Center</span></li>
                <li><span className="text-sm text-muted-500">Contact</span></li>
                <li><span className="text-sm text-muted-500">Privacy Policy</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-muted-900 mb-4">Connect</h4>
              <ul className="space-y-2">
                <li><span className="text-sm text-muted-500">Twitter</span></li>
                <li><span className="text-sm text-muted-500">LinkedIn</span></li>
                <li><span className="text-sm text-muted-500">Instagram</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-muted-200 text-center">
            <p className="text-sm text-muted-400">&copy; 2026 BookIt. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
