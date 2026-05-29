import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { verifyBearerToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyBearerToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get real clients from Supabase
    const { data: clients, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .order('last_visit_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({
      clients: clients?.map(client => ({
        id: client.id,
        name: `${client.first_name} ${client.last_name}`.trim(),
        phone: client.phone,
        email: client.email,
        lastVisit: client.last_visit_at,
        nextAppointment: client.next_appointment_at,
      })) || []
    });

  } catch (error) {
    console.error('Color bar clients error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}
