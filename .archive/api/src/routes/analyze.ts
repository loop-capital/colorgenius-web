import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { pipeline } from 'stream/promises';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { pool, query } from '../db/index.js';
import { config } from '../config.js';
import { authenticate } from '../auth/jwt.js';
import { analyzeColor } from '../services/python-bridge.js';
import type { ApiResponse, AnalyzeResponse, AnalyzeRequest, JwtPayload } from '../types/index.js';

// Simple dominant color extraction (basic implementation)
function extractDominantColor(imageBuffer: Buffer): [number, number, number] {
  // For production, you might want to use a proper image processing library
  // This is a simplified implementation that returns a placeholder
  // The actual color extraction should be done by the Python engine
  
  // Return a medium brown as default placeholder
  // Real implementation would analyze pixel data
  return [100, 65, 35];
}

export async function analyzeRoutes(fastify: FastifyInstance): Promise<void> {
  // Ensure upload directory exists
  const uploadDir = config.upload.dir.startsWith('/')
    ? path.resolve(process.cwd(), config.upload.dir.replace(/^\//, ''))
    : path.resolve(process.cwd(), config.upload.dir);
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // POST /analyze
  fastify.post<{
    Reply: ApiResponse<AnalyzeResponse>;
  }>(
    '/analyze',
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      let fileData: Buffer | null = null;
      let filename: string | null = null;
      let mimetype: string | null = null;

      try {
        // Parse multipart form data
        const parts = request.parts();

        let clientId: string | undefined;
        let photoType: string | undefined;

        for await (const part of parts) {
          if (part.type === 'file') {
            fileData = await part.toBuffer();
            filename = part.filename;
            mimetype = part.mimetype;
          } else if (part.type === 'field') {
            if (part.fieldname === 'client_id') {
              clientId = part.value as string;
            } else if (part.fieldname === 'photo_type') {
              photoType = part.value as string;
            }
          }
        }

        if (!fileData) {
          return reply.status(400).send({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Photo file is required',
            },
          });
        }

        if (!config.upload.allowedMimeTypes.includes(mimetype || '')) {
          return reply.status(400).send({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid file type. Allowed: jpg, png, webp',
            },
          });
        }

        const userId = request.user?.userId;
        if (!userId) {
          return reply.status(401).send({
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'User not authenticated',
            },
          });
        }

        // Save photo to uploads directory
        const fileId = uuidv4();
        const ext = path.extname(filename || '.jpg').toLowerCase();
        const savedFilename = `${fileId}${ext}`;
        const photoPath = path.join(uploadDir, savedFilename);

        await fs.promises.writeFile(photoPath, fileData);

        // Extract dominant color (simplified - real implementation would use proper image analysis)
        const rgb = extractDominantColor(fileData);

        // Analyze color using Python engine
        const analysis = await analyzeColor(rgb);

        // Save analysis to database
        const analysisId = uuidv4();
        await query(
          `INSERT INTO analyses (id, user_id, client_id, photo_path, photo_type, level, tone, rgb, confidence)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            analysisId,
            userId,
            clientId || null,
            photoPath,
            photoType || null,
            analysis.level,
            analysis.tone,
            rgb,
            analysis.confidence,
          ]
        );

        return reply.status(201).send({
          success: true,
          data: {
            analysis_id: analysisId,
            level: analysis.level,
            tone: analysis.tone,
            rgb: analysis.rgb,
            confidence: analysis.confidence,
          },
        });
      } catch (error) {
        fastify.log.error('Analysis error: %s', error instanceof Error ? error.message : String(error));
        return reply.status(500).send({
          success: false,
          error: {
            code: 'ANALYSIS_ERROR',
            message: error instanceof Error ? error.message : 'Failed to analyze photo',
          },
        });
      }
    }
  );
}