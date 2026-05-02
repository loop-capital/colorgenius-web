import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/photos/upload
 * Upload a photo for camera capture analysis.
 *
 * Supports two upload modes:
 * 1. Direct upload: Multipart form data with file
 * 2. Presigned URL: Returns a signed URL for client-side S3/R2 upload
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

      // Validate content length (< 5MB)
      if (contentLength && contentLength > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File too large. Maximum size is 5MB' },
          { status: 413 }
        );
      }

      // Generate presigned upload URL using our Cloudflare Worker
      const workerUrl = 'https://colorgenius-r2-upload.shiny-sky-8891.workers.dev/upload';
      const workerResponse = await fetch(workerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          angle,
          contentType: fileContentType || 'image/jpeg',
        }),
      });

      if (!workerResponse.ok) {
        throw new Error(`Worker responded with status: ${workerResponse.status}`);
      }

      const workerData = await workerResponse.json();

      // Create Photo record in database (commented out for now as prisma isn't set up)
      // const photo = await prisma.photo.create({
      //   data: {
      //     sessionId,
      //     angle,
      //     url: workerData.publicUrl,
      //     original_url: workerData.publicUrl,
      //     format: fileContentType?.split('/')[1] || 'jpeg',
      //     file_size_bytes: contentLength,
      //     analysisStatus: 'pending',
      //   },
      // });

      const photo = {
        id: crypto.randomUUID(),
        sessionId,
        angle,
        uploadUrl: workerData.uploadUrl,
        url: workerData.publicUrl,
        original_url: workerData.publicUrl,
        format: (fileContentType || 'image/jpeg').split('/')[1],
        file_size_bytes: contentLength,
        width: null, // extracted after processing
        height: null,
        analysisStatus: 'pending',
        createdAt: new Date().toISOString(),
        key: workerData.key,
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

    // For direct upload, we still use the worker to get a presigned URL
    const workerUrl = 'https://colorgenius-r2-upload.shiny-sky-8891.workers.dev/upload';
    const workerResponse = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        angle,
        contentType: file.type,
      }),
    });

    if (!workerResponse.ok) {
      throw new Error(`Worker responded with status: ${workerResponse.status}`);
    }

    const workerData = await workerResponse.json();

    // TODO: Upload file directly to the presigned URL
    // TODO: Create Photo record in database
    // TODO: Generate thumbnail

    const photo = {
      id: crypto.randomUUID(),
      sessionId,
      angle,
      uploadUrl: workerData.uploadUrl,
      url: workerData.publicUrl,
      original_url: workerData.publicUrl,
      file_size_bytes: file.size,
      format: file.type.split('/')[1],
      width: null, // extracted after processing
      height: null,
      analysisStatus: 'pending',
      createdAt: new Date().toISOString(),
      key: workerData.key,
    };

    return NextResponse.json({ success: true, data: photo }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}