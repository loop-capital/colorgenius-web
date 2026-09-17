import { PrismaClient } from '@prisma/client';
import { SignJWT } from 'jose';
import crypto from 'crypto';

const prisma = new PrismaClient();
const key = new TextEncoder().encode('colorgenius-dev-secret-change-me');

async function main() {
  const suffix = crypto.randomBytes(4).toString('hex');

  const salon = await prisma.salons.create({
    data: { name: `Test Salon ${suffix}`, slug: `test-salon-inv-${suffix}` },
  });

  const user = await prisma.users.create({
    data: { email: `test-inv-${suffix}@colorgenius-test.local`, password_hash: 'x', salon_id: salon.id },
  });

  const existingItem = await prisma.inventory_items.create({
    data: {
      salon_id: salon.id,
      source: 'square',
      brand: 'Wella',
      shade_code: 'W-6N',
      shade_name: 'Wella 6N',
      category: 'color',
      quantity_on_hand: 5,
      unit_of_measure: 'grams',
    },
  });

  const token = await new SignJWT({ userId: user.id, username: 'test', email: user.email })
    .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('1h').sign(key);

  console.log(JSON.stringify({ salonId: salon.id, userId: user.id, existingItemId: existingItem.id, token }));
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
