import type { FastifyInstance } from 'fastify';
import { query } from '../db/index.js';
import { authenticate } from '../auth/jwt.js';
import type { ApiResponse } from '../types/index.js';

export async function appointmentsRoutes(fastify: FastifyInstance): Promise<void> {
  // GET /appointments
  fastify.get<{
    Reply: ApiResponse<unknown[]>;
  }>(
    '/appointments',
    { preHandler: authenticate },
    async (request, reply) => {
      const userId = request.user?.userId;
      if (!userId) {
        return reply.status(401).send({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'User not authenticated' },
        });
      }

      try {
        const result = await query(
          `SELECT ap.*, c.first_name, c.last_name, c.phone,
                  f.target_level, f.target_tone, f.brand
           FROM appointments ap
           LEFT JOIN clients c ON c.id = ap.client_id
           LEFT JOIN formulations f ON f.id = ap.formulation_id
           WHERE ap.user_id = $1
           ORDER BY ap.scheduled_at ASC
           LIMIT 100`,
          [userId]
        );

        const appointments = result.rows.map((row) => ({
          id: String(row.id),
          user_id: String(row.user_id),
          client_id: row.client_id ? String(row.client_id) : undefined,
          formulation_id: row.formulation_id ? String(row.formulation_id) : undefined,
          client_name: row.first_name ? `${row.first_name} ${row.last_name}` : null,
          client_phone: row.phone ? String(row.phone) : undefined,
          service_type: String(row.service_type || ''),
          scheduled_at: new Date(row.scheduled_at as string),
          duration_minutes: Number(row.duration_minutes) || 60,
          status: String(row.status || 'scheduled'),
          notes: row.notes ? String(row.notes) : undefined,
          created_at: new Date(row.created_at as string),
        }));

        return reply.status(200).send({ success: true, data: appointments });
      } catch (error) {
        fastify.log.error('Appointments list error: %s', error instanceof Error ? error.message : String(error));
        return reply.status(500).send({
          success: false,
          error: { code: 'DATABASE_ERROR', message: 'Failed to fetch appointments' },
        });
      }
    }
  );

  // POST /appointments
  fastify.post<{
    Body: {
      client_id?: string;
      formulation_id?: string;
      service_type?: string;
      scheduled_at: string;
      duration_minutes?: number;
      notes?: string;
    };
    Reply: ApiResponse<unknown>;
  }>(
    '/appointments',
    { preHandler: authenticate },
    async (request, reply) => {
      const userId = request.user?.userId;
      if (!userId) {
        return reply.status(401).send({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'User not authenticated' },
        });
      }

      const { client_id, formulation_id, service_type, scheduled_at, duration_minutes, notes } = request.body || {};

      if (!scheduled_at) {
        return reply.status(400).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'scheduled_at is required' },
        });
      }

      try {
        const result = await query(
          `INSERT INTO appointments (user_id, client_id, formulation_id, service_type, scheduled_at, duration_minutes, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
          [userId, client_id || null, formulation_id || null, service_type || 'color', scheduled_at, duration_minutes || 60, notes || null]
        );

        const row = result.rows[0];
        return reply.status(201).send({
          success: true,
          data: {
            id: String(row.id),
            user_id: String(row.user_id),
            client_id: row.client_id ? String(row.client_id) : undefined,
            formulation_id: row.formulation_id ? String(row.formulation_id) : undefined,
            service_type: String(row.service_type || ''),
            scheduled_at: new Date(row.scheduled_at as string),
            duration_minutes: Number(row.duration_minutes) || 60,
            status: 'scheduled',
            notes: row.notes ? String(row.notes) : undefined,
            created_at: new Date(row.created_at as string),
          },
        });
      } catch (error) {
        fastify.log.error('Create appointment error: %s', error instanceof Error ? error.message : String(error));
        return reply.status(500).send({
          success: false,
          error: { code: 'DATABASE_ERROR', message: 'Failed to create appointment' },
        });
      }
    }
  );

  // PATCH /appointments/:id — update status (e.g. confirm, cancel, complete)
  fastify.patch<{
    Params: { id: string };
    Body: { status?: string; notes?: string };
    Reply: ApiResponse<unknown>;
  }>(
    '/appointments/:id',
    { preHandler: authenticate },
    async (request, reply) => {
      const userId = request.user?.userId;
      if (!userId) {
        return reply.status(401).send({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'User not authenticated' },
        });
      }

      const { id } = request.params;
      const { status, notes } = request.body || {};

      const fields: string[] = [];
      const values: unknown[] = [];
      let i = 1;

      if (status) { fields.push(`status = $${i++}`); values.push(status); }
      if (notes !== undefined) { fields.push(`notes = $${i++}`); values.push(notes || null); }

      if (fields.length === 0) {
        return reply.status(400).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'No fields to update' },
        });
      }

      values.push(id, userId);

      try {
        const result = await query(
          `UPDATE appointments SET ${fields.join(', ')}
           WHERE id = $${i++} AND user_id = $${i}
           RETURNING *`,
          values
        );

        if (result.rows.length === 0) {
          return reply.status(404).send({
            success: false,
            error: { code: 'NOT_FOUND', message: 'Appointment not found' },
          });
        }

        const row = result.rows[0];
        return reply.status(200).send({
          success: true,
          data: {
            id: String(row.id),
            status: String(row.status),
            notes: row.notes ? String(row.notes) : undefined,
            scheduled_at: new Date(row.scheduled_at as string),
          },
        });
      } catch (error) {
        fastify.log.error('Update appointment error: %s', error instanceof Error ? error.message : String(error));
        return reply.status(500).send({
          success: false,
          error: { code: 'DATABASE_ERROR', message: 'Failed to update appointment' },
        });
      }
    }
  );
}
