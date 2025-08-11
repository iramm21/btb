'use server';

import { z } from 'zod';
import { serverLog } from '../../lib/analytics';

const schema = z.object({
  event: z.string().min(1),
  props: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Server action wrapper for logging analytics events.
 */
export async function logEventAction(formDataOrObj: FormData | { event: string; props?: Record<string, unknown> }) {
  const obj =
    formDataOrObj instanceof FormData
      ? {
          event: formDataOrObj.get('event'),
          props: formDataOrObj.get('props')
            ? JSON.parse(formDataOrObj.get('props') as string)
            : undefined,
        }
      : formDataOrObj;
  const { event, props } = schema.parse(obj);
  await serverLog(event, props);
}
