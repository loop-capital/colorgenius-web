/**
 * POST /api/community/upload
 * Upload image for community posts
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/api/types';
import { getCurrentUser } from '@/lib/api/auth';
import { uploadToR2 } from '@/lib/r2';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'NO_FILE', message: 'No file provided' },
      }, { status: 400 });
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'INVALID_TYPE', message: 'Only JPEG, PNG, WebP allowed' },
      }, { status: 415 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'TOO_LARGE', message: 'Max file size is 5MB' },
      }, { status: 413 });
    }

    const ext = file.type.split('/')[1] || 'jpg';
    const key = `community/${user.id}/${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadToR2(key, buffer, file.type);

    return NextResponse.json<ApiResponse<{ url: string; key: string }>>({
      success: true,
      data: { url, key },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json<ApiResponse>({
      success: false,
      error: { code: 'UPLOAD_FAILED', message },
    }, { status: 500 });
  }
}
