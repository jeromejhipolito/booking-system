'use client';

import { DEMO_MODE } from '../lib/demo-data';

export default function DemoBanner() {
  if (!DEMO_MODE) return null;

  return (
    <div className="bg-muted-900 text-white text-sm py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <p className="text-muted-300">
          You are viewing a live demo. All data is simulated.
        </p>
        <a
          href="https://github.com/user/booking-system-v2"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
        >
          View Source on GitHub &rarr;
        </a>
      </div>
    </div>
  );
}
