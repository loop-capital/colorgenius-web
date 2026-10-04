import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getOrCreateStylistForUser } from '@/lib/stylist';

// DELETE /api/v1/auth/tokens/:id — revoke a stylist API token (soft revoke via is_active).
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const stylist = await getOrCreateStylistForUser(user.userId);
  if (!stylist) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const key = await prisma.api_keys.findFirst({
    where: { id: id, owner_type: 'stylist', owner_id: stylist.id },
  });
  if (!key) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.api_keys.update({
    where: { id: key.id },
    data: { is_active: false },
  });

  return NextResponse.json({ revoked: true, id: key.id });
}
