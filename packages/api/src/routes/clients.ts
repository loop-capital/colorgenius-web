import type { FastifyInstance } from 'fastify';
import { query } from '../db/index.js';
import { authenticate } from '../auth/jwt.js';
import type { ApiResponse, Client } from '../types/index.js';

// ─────────────────────────────────────────────
// Clients
// ─────────────────────────────────────────────
export async function clientsRoutes(fastify: FastifyInstance): Promise<void> {
  // GET /clients — list all clients for the authenticated user
  fastify.get<{
    Reply: ApiResponse<Client[]>;
  }>(
    '/clients',
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
        const result = await query<Record<string, unknown>>(
          `SELECT c.*,
                  COUNT(DISTINCT f.id)         AS total_formulations,
                  MAX(f.created_at)            AS last_formulation_at,
                  COUNT(DISTINCT a.id)         AS total_photos
           FROM clients c
           LEFT JOIN formulations f ON f.client_id = c.id AND f.user_id = $1
           LEFT JOIN analyses a ON a.client_id = c.id AND a.user_id = $1
           WHERE c.user_id = $1
           GROUP BY c.id
           ORDER BY c.created_at DESC
           LIMIT 100`,
          [userId]
        );

        const clients: Partial<Client>[] = result.rows.map((row) => ({
          id: String(row.id),
          user_id: String(row.user_id),
          first_name: String(row.first_name || ''),
          last_name: String(row.last_name || ''),
          email: row.email ? String(row.email) : undefined,
          phone: row.phone ? String(row.phone) : undefined,
          notes: row.notes ? String(row.notes) : undefined,
          total_formulations: Number(row.total_formulations) || 0,
          last_formulation_at: row.last_formulation_at ? new Date(row.last_formulation_at as string) : undefined,
          created_at: new Date(row.created_at as string),
        }));

        return reply.status(200).send({ success: true, data: clients as Client[] });
      } catch (error) {
        fastify.log.error('Clients list error: %s', error instanceof Error ? error.message : String(error));
        return reply.status(500).send({
          success: false,
          error: { code: 'DATABASE_ERROR', message: 'Failed to fetch clients' },
        });
      }
    }
  );

  // POST /clients — create a new client
  fastify.post<{
    Body: { first_name: string; last_name: string; email?: string; phone?: string; notes?: string };
    Reply: ApiResponse<Client>;
  }>(
    '/clients',
    { preHandler: authenticate },
    async (request, reply) => {
      const userId = request.user?.userId;
      if (!userId) {
        return reply.status(401).send({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'User not authenticated' },
        });
      }

      const { first_name, last_name, email, phone, notes } = request.body || {};

      if (!first_name?.trim() || !last_name?.trim()) {
        return reply.status(400).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'First name and last name are required' },
        });
      }

      try {
        const result = await query<Record<string, unknown>>(
          `INSERT INTO clients (user_id, first_name, last_name, email, phone, notes)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [userId, first_name.trim(), last_name.trim(), email || null, phone || null, notes || null]
        );

        const row = result.rows[0];
        const client: Client = {
          id: String(row.id),
          user_id: String(row.user_id),
          first_name: String(row.first_name || ''),
          last_name: String(row.last_name || ''),
          email: row.email ? String(row.email) : undefined,
          phone: row.phone ? String(row.phone) : undefined,
          notes: row.notes ? String(row.notes) : undefined,
          total_formulations: 0,
          created_at: new Date(row.created_at as string),
        };

        return reply.status(201).send({ success: true, data: client });
      } catch (error) {
        fastify.log.error('Create client error: %s', error instanceof Error ? error.message : String(error));
        return reply.status(500).send({
          success: false,
          error: { code: 'DATABASE_ERROR', message: 'Failed to create client' },
        });
      }
    }
  );

  // GET /clients/:clientId — get a single client with full history
  fastify.get<{
    Params: { clientId: string };
    Reply: ApiResponse<Client>;
  }>(
    '/clients/:clientId',
    { preHandler: authenticate },
    async (request, reply) => {
      const userId = request.user?.userId;
      if (!userId) {
        return reply.status(401).send({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'User not authenticated' },
        });
      }

      const { clientId } = request.params;

      try {
        const clientResult = await query<Record<string, unknown>>(
          `SELECT c.*,
                  COUNT(DISTINCT f.id)   AS total_formulations,
                  MAX(f.created_at)      AS last_formulation_at
           FROM clients c
           LEFT JOIN formulations f ON f.client_id = c.id AND f.user_id = $1
           WHERE c.id = $2 AND c.user_id = $1
           GROUP BY c.id`,
          [userId, clientId]
        );

        if (clientResult.rows.length === 0) {
          return reply.status(404).send({
            success: false,
            error: { code: 'NOT_FOUND', message: 'Client not found' },
          });
        }

        const row = clientResult.rows[0];

        // Fetch recent formulations for this client
        const formulationsResult = await query<Record<string, unknown>>(
          `SELECT f.*, a.level as current_level, a.tone as current_tone
           FROM formulations f
           LEFT JOIN analyses a ON a.id = f.analysis_id
           WHERE f.client_id = $1 AND f.user_id = $2
           ORDER BY f.created_at DESC
           LIMIT 20`,
          [clientId, userId]
        );

        const client: Client = {
          id: String(row.id),
          user_id: String(row.user_id),
          first_name: String(row.first_name || ''),
          last_name: String(row.last_name || ''),
          email: row.email ? String(row.email) : undefined,
          phone: row.phone ? String(row.phone) : undefined,
          notes: row.notes ? String(row.notes) : undefined,
          total_formulations: Number(row.total_formulations) || 0,
          last_formulation_at: row.last_formulation_at ? new Date(row.last_formulation_at as string) : undefined,
          created_at: new Date(row.created_at as string),
          formulations: formulationsResult.rows.map((fr) => ({
            id: String(fr.id),
            user_id: String(fr.user_id),
            client_id: fr.client_id ? String(fr.client_id) : undefined,
            analysis_id: fr.analysis_id ? String(fr.analysis_id) : undefined,
            current_level: Number(fr.current_level) || undefined,
            current_tone: fr.current_tone ? String(fr.current_tone) : undefined,
            target_level: Number(fr.target_level),
            target_tone: String(fr.target_tone),
            brand: fr.brand ? String(fr.brand) : undefined,
            developer_volume: Number(fr.developer_volume),
            developer_time: Number(fr.developer_time),
            formula_data: fr.formula_data as Record<string, unknown> || {},
            created_at: new Date(fr.created_at as string),
          })),
        };

        return reply.status(200).send({ success: true, data: client });
      } catch (error) {
        fastify.log.error('Get client error: %s', error instanceof Error ? error.message : String(error));
        return reply.status(500).send({
          success: false,
          error: { code: 'DATABASE_ERROR', message: 'Failed to fetch client' },
        });
      }
    }
  );

  // PATCH /clients/:clientId — update a client
  fastify.patch<{
    Params: { clientId: string };
    Body: { first_name?: string; last_name?: string; email?: string; phone?: string; notes?: string };
    Reply: ApiResponse<Client>;
  }>(
    '/clients/:clientId',
    { preHandler: authenticate },
    async (request, reply) => {
      const userId = request.user?.userId;
      if (!userId) {
        return reply.status(401).send({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'User not authenticated' },
        });
      }

      const { clientId } = request.params;
      const { first_name, last_name, email, phone, notes } = request.body || {};

      try {
        const fields: string[] = [];
        const values: unknown[] = [];
        let i = 1;

        if (first_name !== undefined) { fields.push(`first_name = $${i++}`); values.push(first_name.trim()); }
        if (last_name !== undefined) { fields.push(`last_name = $${i++}`); values.push(last_name.trim()); }
        if (email !== undefined) { fields.push(`email = $${i++}`); values.push(email || null); }
        if (phone !== undefined) { fields.push(`phone = $${i++}`); values.push(phone || null); }
        if (notes !== undefined) { fields.push(`notes = $${i++}`); values.push(notes || null); }

        if (fields.length === 0) {
          return reply.status(400).send({
            success: false,
            error: { code: 'VALIDATION_ERROR', message: 'No fields to update' },
          });
        }

        values.push(clientId, userId);
        const result = await query<Record<string, unknown>>(
          `UPDATE clients SET ${fields.join(', ')}, updated_at = NOW()
           WHERE id = $${i++} AND user_id = $${i}
           RETURNING *`,
          values
        );

        if (result.rows.length === 0) {
          return reply.status(404).send({
            success: false,
            error: { code: 'NOT_FOUND', message: 'Client not found' },
          });
        }

        const row = result.rows[0];
        const client: Client = {
          id: String(row.id),
          user_id: String(row.user_id),
          first_name: String(row.first_name || ''),
          last_name: String(row.last_name || ''),
          email: row.email ? String(row.email) : undefined,
          phone: row.phone ? String(row.phone) : undefined,
          notes: row.notes ? String(row.notes) : undefined,
          total_formulations: 0,
          created_at: new Date(row.created_at as string),
        };

        return reply.status(200).send({ success: true, data: client });
      } catch (error) {
        fastify.log.error('Update client error: %s', error instanceof Error ? error.message : String(error));
        return reply.status(500).send({
          success: false,
          error: { code: 'DATABASE_ERROR', message: 'Failed to update client' },
        });
      }
    }
  );

  // DELETE /clients/:clientId
  fastify.delete<{
    Params: { clientId: string };
    Reply: ApiResponse<{ deleted: boolean }>;
  }>(
    '/clients/:clientId',
    { preHandler: authenticate },
    async (request, reply) => {
      const userId = request.user?.userId;
      if (!userId) {
        return reply.status(401).send({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'User not authenticated' },
        });
      }

      const { clientId } = request.params;

      try {
        const result = await query(
          'DELETE FROM clients WHERE id = $1 AND user_id = $2 RETURNING id',
          [clientId, userId]
        );

        if (result.rows.length === 0) {
          return reply.status(404).send({
            success: false,
            error: { code: 'NOT_FOUND', message: 'Client not found' },
          });
        }

        return reply.status(200).send({ success: true, data: { deleted: true } });
      } catch (error) {
        fastify.log.error('Delete client error: %s', error instanceof Error ? error.message : String(error));
        return reply.status(500).send({
          success: false,
          error: { code: 'DATABASE_ERROR', message: 'Failed to delete client' },
        });
      }
    }
  );
}
