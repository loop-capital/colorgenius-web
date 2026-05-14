/**
 * POST /api/community/upload
 * Upload image for community posts
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/api/types';
import { getCurrentUser } from '@/lib/api/auth';

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

    // Use the same R2 worker as photos upload
    const workerUrl = 'https://colorgenius-r2-upload.shiny-sky-8891.workers.dev/upload';
    const workerResponse = await fetch(workerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: `community-${user.id}-${Date.now()}`,
        angle: 'community',
        contentType: file.type,
      }),
    });

    if (!workerResponse.ok) {
      throw new Error(`Worker responded with status: ${workerResponse.status}`);
    }

    const workerData = await workerResponse.json();

    return NextResponse.json<ApiResponse<{ url: string; key: string }>>({
      success: true,
      data: { url: workerData.publicUrl, key: workerData.key },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json<ApiResponse>({
      success: false,
      error: { code: 'UPLOAD_FAILED', message },
    }, { status: 500 });
  }
}
