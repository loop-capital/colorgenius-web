import { prisma } from './prisma';
import type { User } from './auth';
import { getTierConfig, countLinesInBrands, type TierConfig } from './subscription-tiers';

export async function getAllUsers(): Promise<User[]> {
  const dbUsers = await prisma.user.findMany();
  return dbUsers.map(u => prismaToUser(u));
}

export async function findUserById(id: string): Promise<User | null> {
  const u = await prisma.user.findUnique({ where: { id } });
  return u ? prismaToUser(u) : null;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const u = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  return u ? prismaToUser(u) : null;
}

export async function findUserByUsername(username: string): Promise<User | null> {
  const u = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
  });
  return u ? prismaToUser(u) : null;
}

export async function findUserByUsernameOrEmail(usernameOrEmail: string): Promise<User | null> {
  const u = await prisma.user.findFirst({
    where: {
      OR: [
        { username: { equals: usernameOrEmail.toLowerCase() } },
        { email: { equals: usernameOrEmail.toLowerCase() } },
      ],
    },
  });
  return u ? prismaToUser(u) : null;
}

export async function addUser(user: User): Promise<void> {
  await prisma.user.create({
    data: {
      id: user.id,
      email: user.email,
      username: user.username,
      phone: user.phone || null,
      passwordHash: user.passwordHash,
      salonName: user.salonName || null,
      stylistName: user.stylistName || null,

      // Subscription
      accountType: user.accountType,
      salonProfessionals: user.salonProfessionals,
      subscriptionTier: user.subscriptionTier,
      subscriptionStatus: user.subscriptionStatus,
      trialEndsAt: user.trialEndsAt ? new Date(user.trialEndsAt) : null,

      // Tier limits
      maxBrands: user.maxBrands,
      maxLines: user.maxLines,
      maxProfessionals: user.maxProfessionals,

      // Brand/line selection
      selectedBrands: user.selectedBrands || null,
      selectedLinesCount: user.selectedLinesCount,

      // Pricing
      monthlyPriceCents: user.monthlyPriceCents,
      extraLinePriceCents: user.extraLinePriceCents,
    },
  });
}

export async function updateUser(id: string, data: Partial<User>): Promise<User | null> {
  const updateData: Record<string, unknown> = {};

  if (data.salonName !== undefined) updateData.salonName = data.salonName;
  if (data.stylistName !== undefined) updateData.stylistName = data.stylistName;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.selectedBrands !== undefined) {
    updateData.selectedBrands = data.selectedBrands;
    // Count lines
    if (data.selectedBrands) {
      const parsed = JSON.parse(data.selectedBrands) as Record<string, string[]>;
      updateData.selectedLinesCount = countLinesInBrands(parsed);
    } else {
      updateData.selectedLinesCount = 0;
    }
  }
  if (data.subscriptionTier !== undefined) {
    const config = getTierConfig(data.subscriptionTier);
    updateData.subscriptionTier = data.subscriptionTier;
    updateData.maxBrands = config.maxBrands;
    updateData.maxLines = config.maxLines;
    updateData.maxProfessionals = config.maxProfessionals;
    updateData.monthlyPriceCents = config.monthlyPriceCents;
    updateData.extraLinePriceCents = config.extraLinePriceCents;
  }
  if (data.squareCustomerId !== undefined) updateData.squareCustomerId = data.squareCustomerId;
  if (data.squareSubscriptionId !== undefined) updateData.squareSubscriptionId = data.squareSubscriptionId;

  if (Object.keys(updateData).length === 0) return null;

  const u = await prisma.user.update({
    where: { id },
    data: updateData,
  });
  return prismaToUser(u);
}

// Helper to convert Prisma User model to the User interface used by auth.ts
function prismaToUser(u: Record<string, unknown>): User {
  return {
    id: u.id as string,
    email: u.email as string,
    username: u.username as string,
    phone: (u.phone as string) || undefined,
    passwordHash: u.passwordHash as string,
    salonName: (u.salonName as string) || undefined,
    stylistName: (u.stylistName as string) || undefined,

    accountType: (u.accountType as string) || 'solo',
    salonProfessionals: (u.salonProfessionals as number) || 1,
    subscriptionTier: (u.subscriptionTier as string) || 'trial',
    subscriptionStatus: (u.subscriptionStatus as string) || 'trialing',
    trialEndsAt: u.trialEndsAt ? (u.trialEndsAt as Date).toISOString() : undefined,

    maxBrands: (u.maxBrands as number) || 1,
    maxLines: (u.maxLines as number) || 1,
    maxProfessionals: (u.maxProfessionals as number) || 1,

    selectedBrands: (u.selectedBrands as string) || undefined,
    selectedLinesCount: (u.selectedLinesCount as number) || 0,

    squareCustomerId: (u.squareCustomerId as string) || undefined,
    squareSubscriptionId: (u.squareSubscriptionId as string) || undefined,

    monthlyPriceCents: (u.monthlyPriceCents as number) || 2500,
    extraLinePriceCents: (u.extraLinePriceCents as number) || 1000,

    voiceAssistantEnabled: (u.voiceAssistantEnabled as boolean) ?? false,
    voiceAssistantRateCentsPerMin: (u.voiceAssistantRateCentsPerMin as number) || 5,
    voiceMinutesUsedThisMonth: (u.voiceMinutesUsedThisMonth as number) || 0,
    squareCardOnFile: (u.squareCardOnFile as boolean) ?? false,

    createdAt: u.createdAt ? (u.createdAt as Date).toISOString() : new Date().toISOString(),
  };
}
