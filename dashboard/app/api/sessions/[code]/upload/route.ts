import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

/**
 * POST /api/sessions/[code]/upload
 * Upload a photo via session code for phone-to-iPad transfer.
 *
 * Accepts multipart form data with an image file.
 *
 * Request body (multipart):
 *   - file: File (image/jpeg, image/png, image/webp; max 10MB)
 *
 * Response:
 *   200: { success: true, data: { photoUrl } }
 *   400: { error: "Missing file" }
 *   404: { error: "Invalid or expired session code" }
 *   413: { error: "File too large" }
 *   415: { error: "Unsupported file type" }
 *   500: { error: "Internal server error" }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // Find and validate session code
    const sessionCode = await prisma.session_codes.findFirst({
      where: {
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!sessionCode || !sessionCode.formulationSessionId) {
      return NextResponse.json(
        { error: 'Invalid or expired session code' },
        { status: 404 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Missing file field in form data' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}. Must be JPEG, PNG, or WebP` },
        { status: 415 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 413 }
      );
    }

    // Save file locally
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.type.split('/')[1] || 'jpg';
    const filename = `${sessionCode.formulationSessionId}-${Date.now()}.${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'sessions');
    await mkdir(uploadDir, { recursive: true });

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const photoUrl = `/uploads/sessions/${filename}`;

    // Update formulation session with photo URL
    await prisma.formulation_sessions.update({
      where: { id: sessionCode.formulationSessionId },
      data: { photoUrl },
    });

    // Mark session code as used
    await prisma.session_codes.update({
      where: { id: sessionCode.id },
      data: { used: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        photoUrl,
        sessionId: sessionCode.formulationSessionId,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
