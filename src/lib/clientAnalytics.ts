'use client';

import { logEventAction } from '../app/actions/analytics';

/**
 * Send a client-side analytics event via server action.
 */
export function logEvent(event: string, props?: Record<string, unknown>) {
  return logEventAction({ event, props });
}
