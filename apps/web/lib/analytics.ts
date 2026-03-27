/**
 * Event Tracking — BR-036
 * Standardized noun-verb events, no PII.
 * Console.log in dev; ready for real analytics (Segment/Mixpanel) in integration.
 */

type EventName =
  | 'service.searched'
  | 'service.viewed'
  | 'service.filtered'
  | 'booking.step_completed'
  | 'booking.created'
  | 'booking.cancelled'
  | 'booking.rescheduled'
  | 'provider.onboarding_started'
  | 'provider.onboarding_completed'
  | 'auth.registered'
  | 'auth.logged_in';

interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

export function trackEvent(event: EventName, properties?: EventProperties) {
  // Strip any PII fields before tracking
  const safeProps = properties ? { ...properties } : {};
  delete (safeProps as any).email;
  delete (safeProps as any).phone;
  delete (safeProps as any).name;
  delete (safeProps as any).firstName;
  delete (safeProps as any).lastName;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[analytics] ${event}`, safeProps);
  }

  // TODO: In integration (C4), replace with real analytics:
  // segment.track(event, safeProps);
  // or: fetch('/api/events', { method: 'POST', body: JSON.stringify({ event, ...safeProps }) });
}
