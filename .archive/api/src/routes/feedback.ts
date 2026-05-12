import type { FastifyInstance } from 'fastify';
import { query } from '../db/index.js';
import { authenticate } from '../auth/jwt.js';
import type { ApiResponse } from '../types/index.js';

export async function feedbackRoutes(fastify: FastifyInstance): Promise<void> {
  // POST /feedback — submit a score/feedback after a color service
  fastify.post<{
    Body: {
      formulation_id?: string;
      client_id?: string;
      color_accuracy_rating?: number;
      formula_precision_rating?: number;
      client_satisfaction_rating?: number;
      condition_after_rating?: number;
      overall_rating?: number;
      outcome_level?: number;
      outcome_tone?: string;
      adjustments_made?: string;
      client_feedback?: string;
      would_use_again?: boolean;
      suggestions?: string;
    };
    Reply: ApiResponse<unknown>;
  }>(
    '/feedback',
    { preHandler: authenticate },
    async (request, reply) => {
      const userId = request.user?.userId;
      if (!userId) {
        return reply.status(401).send({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'User not authenticated' },
        });
      }

      const {
        formulation_id, client_id,
        color_accuracy_rating, formula_precision_rating,
        client_satisfaction_rating, condition_after_rating,
        overall_rating, outcome_level, outcome_tone,
        adjustments_made, client_feedback, would_use_again, suggestions,
      } = request.body || {};

      try {
        const result = await query(
          `INSERT INTO feedback (
            formulation_id, user_id, client_id,
            color_accuracy_rating, formula_precision_rating,
            client_satisfaction_rating, condition_after_rating,
            overall_rating, outcome_level, outcome_tone,
            adjustments_made, client_feedback, would_use_again, suggestions
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
          RETURNING *`,
          [
            formulation_id || null, userId, client_id || null,
            color_accuracy_rating || null, formula_precision_rating || null,
            client_satisfaction_rating || null, condition_after_rating || null,
            overall_rating || null, outcome_level || null, outcome_tone || null,
            adjustments_made || null, client_feedback || null,
            would_use_again !== undefined ? would_use_again : null,
            suggestions || null,
          ]
        );

        const row = result.rows[0];
        return reply.status(201).send({
          success: true,
          data: {
            id: String(row.id),
            formulation_id: row.formulation_id ? String(row.formulation_id) : undefined,
            overall_rating: row.overall_rating ? Number(row.overall_rating) : null,
            would_use_again: row.would_use_again,
            created_at: new Date(row.created_at as string),
          },
        });
      } catch (error) {
        fastify.log.error('Feedback error: %s', error instanceof Error ? error.message : String(error));
        return reply.status(500).send({
          success: false,
          error: { code: 'DATABASE_ERROR', message: 'Failed to submit feedback' },
        });
      }
    }
  );

  // GET /feedback/:formulationId — get feedback for a specific formulation
  fastify.get<{
    Params: { formulationId: string };
    Reply: ApiResponse<unknown | null>;
  }>(
    '/feedback/:formulationId',
    { preHandler: authenticate },
    async (request, reply) => {
      const userId = request.user?.userId;
      if (!userId) {
        return reply.status(401).send({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'User not authenticated' },
        });
      }

      const { formulationId } = request.params;

      try {
        const result = await query(
          `SELECT * FROM feedback WHERE formulation_id = $1 AND user_id = $2 LIMIT 1`,
          [formulationId, userId]
        );

        if (result.rows.length === 0) {
          return reply.status(200).send({ success: true, data: null });
        }

        const row = result.rows[0];
        return reply.status(200).send({
          success: true,
          data: {
            id: String(row.id),
            formulation_id: row.formulation_id ? String(row.formulation_id) : undefined,
            color_accuracy_rating: row.color_accuracy_rating ? Number(row.color_accuracy_rating) : null,
            formula_precision_rating: row.formula_precision_rating ? Number(row.formula_precision_rating) : null,
            client_satisfaction_rating: row.client_satisfaction_rating ? Number(row.client_satisfaction_rating) : null,
            condition_after_rating: row.condition_after_rating ? Number(row.condition_after_rating) : null,
            overall_rating: row.overall_rating ? Number(row.overall_rating) : null,
            outcome_level: row.outcome_level ? Number(row.outcome_level) : null,
            outcome_tone: row.outcome_tone ? String(row.outcome_tone) : null,
            adjustments_made: row.adjustments_made ? String(row.adjustments_made) : null,
            client_feedback: row.client_feedback ? String(row.client_feedback) : null,
            would_use_again: row.would_use_again,
            suggestions: row.suggestions ? String(row.suggestions) : null,
            created_at: new Date(row.created_at as string),
          },
        });
      } catch (error) {
        fastify.log.error('Get feedback error: %s', error instanceof Error ? error.message : String(error));
        return reply.status(500).send({
          success: false,
          error: { code: 'DATABASE_ERROR', message: 'Failed to fetch feedback' },
        });
      }
    }
  );
}
