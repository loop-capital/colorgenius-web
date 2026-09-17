import { prisma } from '@/lib/prisma';

/**
 * Resolve the community/marketplace creator profile (stylists row) for an
 * authenticated user (users.id, from a verified JWT — see lib/auth.ts).
 *
 * Registration creates this row directly now, but any account created before
 * that fix shipped has no linked stylist yet — lazily create one here so
 * existing users aren't locked out of community/marketplace features.
 * `handle` is left null in that case; routes that require a public handle
 * (posting, publishing) should check for it and prompt profile completion
 * rather than assume it's set.
 */
export async function getOrCreateStylistForUser(userId: string) {
  const existing = await prisma.stylists.findUnique({ where: { user_id: userId } });
  if (existing) return existing;

  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) return null;

  return prisma.stylists.create({
    data: {
      user_id: user.id,
      email: user.email,
      password_hash: user.password_hash,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      display_name: user.first_name || user.email,
      salon_id: user.salon_id,
    },
  });
}

/** Resolve the salon an authenticated user belongs to, if any. */
export async function getSalonIdForUser(userId: string): Promise<string | null> {
  const user = await prisma.users.findUnique({ where: { id: userId }, select: { salon_id: true } });
  return user?.salon_id ?? null;
}
