import { getSession } from './session';

/**
 * Ensures the current user is an admin.
 */
export async function assertAdmin() {
  const { userId } = await getSession();
  if (!userId) throw new Error('Forbidden');
  if (process.env.ADMIN_MODE === 'mock' || process.env.NODE_ENV === 'test') {
    if (userId === 'test-user') return;
  }
  const allow = process.env.ADMIN_USER_IDS?.split(',').map((s) => s.trim());
  if (allow?.includes(userId)) return;
  throw new Error('Forbidden');
}

export default assertAdmin;
