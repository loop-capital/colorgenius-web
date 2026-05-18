/**
 * POST /api/marketplace/upload
 * Upload a formula result photo to Cloudflare R2
 */

import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2 } from '@/lib/r2';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: { code: 'NO_FILE', message: 'No file uploaded' } }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: { code: 'INVALID_TYPE', message: 'Only JPEG, PNG, and WebP allowed' } }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: { code: 'TOO_LARGE', message: 'Max 5MB' } }, { status: 400 });
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const key = `formulas/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadToR2(key, buffer, file.type);

    return NextResponse.json({
      success: true,
      data: { url, filename: key, size: file.size, type: file.type },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ success: false, error: { code: 'UPLOAD_FAILED', message } }, { status: 500 });
  }
}
