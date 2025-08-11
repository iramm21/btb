import { logEvent } from './repos/events';
import { getSession } from './auth/session';

/**
 * Log an analytics event for the current session user.
 */
export async function serverLog(event: string, props?: Record<string, unknown>) {
  const { userId } = await getSession();
  await logEvent({ userId, event, props });
}

export default serverLog;
