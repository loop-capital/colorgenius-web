import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, requireAuth } from '@/lib/api/auth';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!requireAuth(user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || 'all';
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const where: any = { stylist_id: user.id };
    if (from || to) {
      where.created_at = {};
      if (from) where.created_at.gte = new Date(from);
      if (to) where.created_at.lte = new Date(to);
    }

    const entries: any[] = [];

    // Fetch formulations
    if (type === 'all' || type === 'formulation') {
      const formulations = await prisma.formulations.findMany({
        where: {
          ...where,
          ...(search ? {
            OR: [
              { brand: { contains: search, mode: 'insensitive' } },
              { client: { first_name: { contains: search, mode: 'insensitive' } } },
              { client: { last_name: { contains: search, mode: 'insensitive' } } },
            ],
          } : {}),
        },
        include: { client: { select: { first_name: true, last_name: true } } },
        orderBy: { created_at: 'desc' },
        take: 50,
      });

      for (const f of formulations) {
        entries.push({
          id: f.id,
          type: 'formulation',
          clientName: f.client ? `${f.client.first_name} ${f.client.last_name || ''}`.trim() : null,
          brand: f.brand,
          serviceType: f.action_type,
          targetLevel: f.target_level,
          targetTone: f.target_tone,
          satisfaction: null,
          createdAt: f.created_at?.toISOString(),
        });
      }
    }

    // Sort by date
    entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ history: entries.slice(0, 50) });
  } catch (error) {
    console.error('GET /api/history error:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
