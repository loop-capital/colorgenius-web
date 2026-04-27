import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { query } from '../db/index.js';
import { authenticate } from '../auth/jwt.js';
import type { ApiResponse, Analysis, HistoryQuery, PaginatedResponse } from '../types/index.js';

export async function historyRoutes(fastify: FastifyInstance): Promise<void> {
  // GET /history
  fastify.get<{
    Querystring: HistoryQuery;
    Reply: ApiResponse<PaginatedResponse<Analysis>>;
  }>(
    '/history',
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
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

      const page = Math.max(1, request.query.page || 1);
      const limit = Math.min(100, Math.max(1, request.query.limit || 20));
      const offset = (page - 1) * limit;

      try {
        // Get total count
        const countResult = await query<{ count: string }>(
          'SELECT COUNT(*) FROM analyses WHERE user_id = $1',
          [userId]
        );
        const total = parseInt(countResult.rows[0]?.count || '0', 10);

        // Get paginated analyses
        const result = await query<{
          id: string;
          user_id: string;
          client_id: string | null;
          photo_path: string | null;
          photo_type: string | null;
          level: number;
          tone: string;
          rgb: string;
          confidence: number;
          created_at: Date;
        }>(
          `SELECT * FROM analyses 
           WHERE user_id = $1 
           ORDER BY created_at DESC 
           LIMIT $2 OFFSET $3`,
          [userId, limit, offset]
        );

        const analyses: Analysis[] = result.rows.map((row) => ({
          id: row.id,
          user_id: row.user_id,
          client_id: row.client_id || undefined,
          photo_path: row.photo_path || undefined,
          photo_type: row.photo_type || undefined,
          level: row.level,
          tone: row.tone,
          rgb: row.rgb.match(/\d+/g)?.map(Number) as [number, number, number] || [0, 0, 0],
          confidence: row.confidence,
          created_at: row.created_at,
        }));

        return reply.status(200).send({
          success: true,
          data: {
            items: analyses,
            total,
            page,
            limit,
            total_pages: Math.ceil(total / limit),
          },
        });
      } catch (error) {
        fastify.log.error('History error: %s', error instanceof Error ? error.message : String(error));
        return reply.status(500).send({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch history',
          },
        });
      }
    }
  );

  // GET /history/:id
  fastify.get<{
    Params: { id: string };
    Reply: ApiResponse<Analysis | null>;
  }>(
    '/history/:id',
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
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

      const { id } = request.params;

      if (!id) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Analysis ID is required',
          },
        });
      }

      try {
        const result = await query<{
          id: string;
          user_id: string;
          client_id: string | null;
          photo_path: string | null;
          photo_type: string | null;
          level: number;
          tone: string;
          rgb: string;
          confidence: number;
          created_at: Date;
        }>(
          'SELECT * FROM analyses WHERE id = $1 AND user_id = $2',
          [id, userId]
        );

        if (result.rows.length === 0) {
          return reply.status(200).send({
            success: true,
            data: null,
          });
        }

        const row = result.rows[0];
        const analysis: Analysis = {
          id: row.id,
          user_id: row.user_id,
          client_id: row.client_id || undefined,
          photo_path: row.photo_path || undefined,
          photo_type: row.photo_type || undefined,
          level: row.level,
          tone: row.tone,
          rgb: row.rgb.match(/\d+/g)?.map(Number) as [number, number, number] || [0, 0, 0],
          confidence: row.confidence,
          created_at: row.created_at,
        };

        return reply.status(200).send({
          success: true,
          data: analysis,
        });
      } catch (error) {
        fastify.log.error('History error: %s', error instanceof Error ? error.message : String(error));
        return reply.status(500).send({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch analysis',
          },
        });
      }
    }
  );
}