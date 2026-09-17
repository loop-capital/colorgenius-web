import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

/**
 * Platform-admin check — distinct from a salon owner/manager (who can only
 * manage their own salon). role === 'admin' on users is the real, enforced
 * marker; there's no self-serve way to get this role, it's set directly in
 * the database for the handful of people who run the platform.
 *
 * Returns the verified admin's userId, or null if the request isn't from an
 * authenticated admin (caller returns 401/403 as appropriate).
 */
export async function requireAdmin(request: Request): Promise<{ userId: string } | null> {
  const authUser = await getUserFromRequest(request);
  if (!authUser) return null;

  const user = await prisma.users.findUnique({
    where: { id: authUser.userId },
    select: { role: true },
  });
  if (user?.role !== 'admin') return null;

  return { userId: authUser.userId };
}
