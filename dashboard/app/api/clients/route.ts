import { NextRequest, NextResponse } from 'next/server';
import { getClients, saveClient, getClient, deleteClient } from '@/lib/storage';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const search = searchParams.get('search');
  
  if (id) {
    const client = getClient(id);
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    return NextResponse.json({ client, total: 1 });
  }
  
  let clients = getClients();
  if (search) {
    const q = search.toLowerCase();
    clients = clients.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q))
    );
  }
  return NextResponse.json({ clients, total: clients.length });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.name || body.name.trim() === '') {
      return NextResponse.json({ error: 'Client name is required' }, { status: 400 });
    }

    const client = saveClient({
      name: body.name.trim(),
      email: body.email?.trim(),
      phone: body.phone?.trim(),
      notes: body.notes?.trim(),
      favoriteBrand: body.favoriteBrand,
      conditions: body.conditions || [],
    });

    return NextResponse.json({ client, success: true }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save client';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    const existing = getClient(body.id);
    if (!existing) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const updated = saveClient({
      ...existing,
      ...body,
      id: body.id,
    });

    return NextResponse.json({ client: updated, success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update client';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    deleteClient(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete client';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
