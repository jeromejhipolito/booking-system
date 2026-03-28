'use client';

import { DEMO_MODE } from '../lib/demo-data';

export default function DemoBanner() {
  if (!DEMO_MODE) return null;

  return (
    <div className="bg-muted-900 text-white text-xs py-2 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1">
        <p className="text-muted-300">
          <span className="font-semibold text-white">Portfolio Demo</span>
          {' · '}NestJS + Next.js 14 · PostgreSQL EXCLUSION constraints for atomic booking · Outbox-pattern notifications · RRULE availability scheduling
        </p>
        <div className="flex items-center gap-3">
          <a
            href="#architecture-decisions"
            className="text-primary-400 hover:text-primary-300 font-medium transition-colors whitespace-nowrap"
          >
            View Architecture
          </a>
          <a
            href="https://github.com/jeromejhipolito/booking-system"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-400 hover:text-primary-300 font-medium transition-colors whitespace-nowrap"
          >
            View Source &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
