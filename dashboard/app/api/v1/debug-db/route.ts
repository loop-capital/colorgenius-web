import { NextResponse } from 'next/server';
import net from 'net';

// TEMPORARY debug endpoint for E2E troubleshooting. DELETE after.
export async function GET(req: Request) {
  const out: any = { ts: new Date().toISOString() };
  const raw = process.env.DATABASE_URL || '';
  let password = '';
  try {
    const u = new URL(raw);
    out.db_host = u.hostname;
    password = u.password; // keep encoded; decode per-variant below
  } catch { out.db_parse_error = true; }
  const pw = decodeURIComponent(password);

  const mode = new URL(req.url).searchParams.get('mode') || 'report';

  if (mode === 'report') {
    try {
      const u = new URL(raw);
      out.db_port = u.port || '5432'; out.db_user = u.username;
      out.db_name = u.pathname; out.url_len = raw.length;
    } catch {}
    const t0 = Date.now();
    try {
      await new Promise<void>((resolve, reject) => {
        const s = net.connect(parseInt(new URL(raw).port || '5432'), new URL(raw).hostname);
        const timer = setTimeout(() => { s.destroy(); reject(new Error('tcp timeout 8s')); }, 8000);
        s.on('connect', () => { clearTimeout(timer); s.end(); resolve(); });
        s.on('error', (e) => { clearTimeout(timer); reject(e); });
      });
      out.tcp = 'OK in ' + (Date.now() - t0) + 'ms';
    } catch (e: any) { out.tcp = 'FAIL: ' + (e.message || e); }
    const t1 = Date.now();
    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.$queryRaw`SELECT 1`;
      out.prisma = 'OK in ' + (Date.now() - t1) + 'ms';
    } catch (e: any) { out.prisma = 'FAIL: ' + String(e.message || e).slice(0, 200); }
    return NextResponse.json(out);
  }

  // mode=probe: try pooler N variants with Prisma, report which authenticates
  const { PrismaClient } = await import('@prisma/client');
  const ref = 'beuiayrnzbgvvqfgsenc';
  const results: any[] = [];
  for (const n of [0, 1, 2]) {
    for (const port of [5432, 6543]) {
      const host = `aws-${n}-us-west-2.pooler.supabase.com`;
      const url = `postgresql://postgres.${ref}:${encodeURIComponent(pw)}@${host}:${port}/postgres?connect_timeout=8`;
      const t0 = Date.now();
      const pc = new PrismaClient({ datasources: { db: { url } } });
      try {
        await pc.$queryRaw`SELECT 1`;
        results.push({ host, port, status: 'SUCCESS in ' + (Date.now() - t0) + 'ms' });
      } catch (e: any) {
        results.push({ host, port, status: 'FAIL: ' + String(e.message || e).replace(/\n/g, ' ').slice(0, 100) });
      } finally {
        await pc.$disconnect().catch(() => {});
      }
    }
  }
  out.probe_results = results;
  return NextResponse.json(out);
}
