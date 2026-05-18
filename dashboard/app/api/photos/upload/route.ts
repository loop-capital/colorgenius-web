import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2, getPresignedUploadUrl, R2_PUBLIC_URL } from '@/lib/r2';

/**
 * POST /api/photos/upload
 * Upload a photo for camera capture analysis.
 *
 * Supports two upload modes:
 * 1. Direct upload: Multipart form data with file
 * 2. Presigned URL: Returns a signed URL for client-side R2 upload
 *
 * Request body (multipart):
 *   - file: File (image/jpeg, image/png, image/webp; max 5MB)
 *   - sessionId: string (required, links to photo session)
 *   - angle: "roots" | "mid" | "ends" (required)
 *
 * Request body (presigned URL mode):
 *   - sessionId: string (required)
 *   - angle: "roots" | "mid" | "ends" (required)
 *   - contentType: string (e.g., "image/jpeg")
 *   - contentLength: number (bytes)
 *
 * Response:
 *   201: { success: true, data: { id, url, uploadUrl?, ... } }
 *   400: { error: "Missing required fields" }
 *   413: { error: "File too large. Maximum size is 5MB" }
 *   415: { error: "Unsupported file type" }
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    // Presigned URL mode (JSON request)
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { sessionId, angle, contentType: fileContentType, contentLength } = body;

      if (!sessionId || !angle) {
        return NextResponse.json(
          { error: 'Missing required fields: sessionId, angle' },
          { status: 400 }
        );
      }

      const validAngles = ['roots', 'mid', 'ends'];
      if (!validAngles.includes(angle)) {
        return NextResponse.json(
          { error: `Invalid angle. Must be one of: ${validAngles.join(', ')}` },
          { status: 400 }
        );
      }

      if (contentLength && contentLength > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File too large. Maximum size is 5MB' },
          { status: 413 }
        );
      }

      const mimeType = fileContentType || 'image/jpeg';
      const ext = mimeType.split('/')[1] || 'jpg';
      const key = `photos/${sessionId}/${angle}-${Date.now()}.${ext}`;

      const uploadUrl = await getPresignedUploadUrl(key, mimeType);
      const publicUrl = `${R2_PUBLIC_URL}/${key}`;

      const photo = {
        id: crypto.randomUUID(),
        sessionId,
        angle,
        uploadUrl,
        url: publicUrl,
        original_url: publicUrl,
        format: ext,
        file_size_bytes: contentLength,
        width: null,
        height: null,
        analysisStatus: 'pending',
        createdAt: new Date().toISOString(),
        key,
      };

      return NextResponse.json({ success: true, data: photo }, { status: 201 });
    }

    // Direct upload mode (multipart form data)
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const sessionId = formData.get('sessionId') as string | null;
    const angle = formData.get('angle') as string | null;

    if (!file || !sessionId || !angle) {
      return NextResponse.json(
        { error: 'Missing required fields: file, sessionId, angle' },
        { status: 400 }
      );
    }

    const validAngles = ['roots', 'mid', 'ends'];
    if (!validAngles.includes(angle)) {
      return NextResponse.json(
        { error: `Invalid angle. Must be one of: ${validAngles.join(', ')}` },
        { status: 400 }
      );
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type. Must be one of: ${validTypes.join(', ')}` },
        { status: 415 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB' },
        { status: 413 }
      );
    }

    const ext = file.type.split('/')[1] || 'jpg';
    const key = `photos/${sessionId}/${angle}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const publicUrl = await uploadToR2(key, buffer, file.type);

    const photo = {
      id: crypto.randomUUID(),
      sessionId,
      angle,
      url: publicUrl,
      original_url: publicUrl,
      file_size_bytes: file.size,
      format: ext,
      width: null,
      height: null,
      analysisStatus: 'pending',
      createdAt: new Date().toISOString(),
      key,
    };

    return NextResponse.json({ success: true, data: photo }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
