/**
 * POST /api/marketplace/upload
 * Upload a formula result photo to Cloudflare R2
 */

import { NextRequest, NextResponse } from 'next/server';

const R2_ENDPOINT = process.env.R2_ENDPOINT || '';
const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY || '';
const R2_SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY || '';
const R2_BUCKET = process.env.R2_BUCKET_NAME || 'colorgenius-photos-beta';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-bb99062a526e4db384e390a5bdd65455.r2.dev';

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
    const filename = `formulas/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to R2 via S3-compatible API
    if (R2_ENDPOINT && R2_ACCESS_KEY !== 'placeholder') {
      const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
      const s3 = new S3Client({
        region: 'auto',
        endpoint: R2_ENDPOINT,
        credentials: { accessKeyId: R2_ACCESS_KEY, secretAccessKey: R2_SECRET_KEY },
      });
      await s3.send(new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: filename,
        Body: buffer,
        ContentType: file.type,
      }));
    }

    const publicUrl = `${R2_PUBLIC_URL}/${filename}`;

    return NextResponse.json({
      success: true,
      data: { url: publicUrl, filename, size: file.size, type: file.type },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ success: false, error: { code: 'UPLOAD_FAILED', message } }, { status: 500 });
  }
}
