import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { PrismaClient } from '@prisma/client';
import { createSalonClient } from '@/lib/square-multi';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'cg-secret-key');

async function getAuthUser() {
  const token = cookies().get('auth-token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });
    return payload as { id: string; email: string; salon_id?: string };
  } catch { return null; }
}

// Map Square customer to COLORgenius client schema
function mapSquareCustomer(customer: any, salonId: string) {
  const name = `${customer.given_name || ''} ${customer.family_name || ''}`.trim();
  return {
    first_name: customer.given_name || name || 'Unknown',
    last_name: customer.family_name || '',
    email: customer.email_address || null,
    phone: customer.phone_number || null,
    square_customer_id: customer.id,
    salon_id: salonId,
    general_notes: customer.note || null,
  };
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const salonId = body.salon_id || user.salon_id;

    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID required' }, { status: 400 });
    }

    // Check Square is connected for this salon
    const squareConn = await prisma.square_connections.findFirst({
      where: { salon_id: salonId },
    });

    if (!squareConn?.access_token) {
      return NextResponse.json({ error: 'Square not connected for this salon' }, { status: 400 });
    }

    const stats = { imported: 0, updated: 0, skipped: 0, errors: 0, details: [] as any[] };

    // Use existing createSalonClient from lib/square-multi
    const square = createSalonClient(squareConn.access_token);

    // Paginate through all Square customers (100 per page)
    let cursor: string | undefined;
    let hasMore = true;

    while (hasMore) {
      const result: any = await square.customersApi.listCustomers(cursor, undefined, 100);
      const customers = result.result?.customers || [];

      for (const customer of customers) {
        try {
          const mapped = mapSquareCustomer(customer, salonId);

          // Upsert: match by square_customer_id first, then email
          let existing = await prisma.clients.findFirst({
            where: { square_customer_id: customer.id },
          });

          if (!existing && mapped.email) {
            existing = await prisma.clients.findFirst({
              where: {
                salon_id: salonId,
                email: mapped.email,
              },
            });
          }

          if (existing) {
            // Update — only overwrite fields Square provides, keep existing ones
            await prisma.clients.update({
              where: { id: existing.id },
              data: {
                first_name: mapped.first_name,
                last_name: mapped.last_name,
                email: mapped.email || existing.email,
                phone: mapped.phone || existing.phone,
                square_customer_id: mapped.square_customer_id,
                general_notes: mapped.general_notes || existing.general_notes,
                updated_at: new Date(),
              },
            });
            stats.updated++;
            stats.details.push({ square_id: customer.id, action: 'updated', client_id: existing.id });
          } else {
            // Create new client
            const newClient = await prisma.clients.create({
              data: mapped,
            });
            stats.imported++;
            stats.details.push({ square_id: customer.id, action: 'created', client_id: newClient.id });
          }
        } catch (err) {
          stats.errors++;
          stats.details.push({ square_id: customer.id, action: 'error', error: err instanceof Error ? err.message : 'Unknown error' });
        }
      }

      cursor = result.result?.cursor;
      hasMore = !!cursor && customers.length === 100;
    }

    // Update last sync timestamp
    await prisma.square_connections.update({
      where: { id: squareConn.id },
      data: { last_sync_at: new Date() },
    });

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('[square/clients/sync] Error:', error);
    return NextResponse.json({ error: error.message || 'Sync failed' }, { status: 500 });
  }
}
