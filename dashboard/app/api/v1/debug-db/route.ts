import { NextResponse } from 'next/server';
import net from 'net';

// TEMPORARY debug endpoint for E2E troubleshooting. DELETE after.
export async function GET() {
  const out: any = { ts: new Date().toISOString() };
  const raw = process.env.DATABASE_URL || '';
  try {
    const u = new URL(raw);
    out.db_host = u.hostname;
    out.db_port = u.port || '5432';
    out.db_user = u.username;
    out.db_name = u.pathname;
    out.url_len = raw.length;
  } catch {
    out.db_parse_error = true;
    out.url_len = raw.length;
  }

  // TCP connectivity check
  if (out.db_host) {
    const t0 = Date.now();
    try {
      await new Promise<void>((resolve, reject) => {
        const s = net.connect(parseInt(out.db_port || '5432'), out.db_host);
        const timer = setTimeout(() => { s.destroy(); reject(new Error('tcp timeout 8s')); }, 8000);
        s.on('connect', () => { clearTimeout(timer); s.end(); resolve(); });
        s.on('error', (e) => { clearTimeout(timer); reject(e); });
      });
      out.tcp = 'OK in ' + (Date.now() - t0) + 'ms';
    } catch (e: any) {
      out.tcp = 'FAIL: ' + (e.message || e) + ' after ' + (Date.now() - t0) + 'ms';
    }
  }

  // Prisma query check
  const t1 = Date.now();
  try {
    const { prisma } = await import('@/lib/prisma');
    await prisma.$queryRaw`SELECT 1`;
    out.prisma = 'OK in ' + (Date.now() - t1) + 'ms';
  } catch (e: any) {
    out.prisma = 'FAIL: ' + String(e.message || e).slice(0, 300) + ' after ' + (Date.now() - t1) + 'ms';
  }

  return NextResponse.json(out);
}
