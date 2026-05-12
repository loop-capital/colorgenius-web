import type { FastifyInstance } from 'fastify';
import { query } from '../db/index.js';
import { authenticate } from '../auth/jwt.js';
import type { ApiResponse, ColorLine, ColorLineQuery } from '../types/index.js';

// Maps shades table columns to the ColorLine interface
function rowToColorLine(row: Record<string, unknown>): ColorLine {
  const rgbArr = row.rgb;
  const rgb: [number, number, number] = Array.isArray(rgbArr) && rgbArr.length >= 3
    ? [Number(rgbArr[0]), Number(rgbArr[1]), Number(rgbArr[2])]
    : [0, 0, 0];
  return {
    id: String(row.id),
    brand: String(row.brand),
    product_line: String(row.product_line),
    shade_code: String(row.shade_code),
    shade_name: String(row.shade_name),
    level: Number(row.level),
    tone: String(row.primary_tone || row.tone || 'N'),
    rgb,
    is_natural: Boolean(row.is_natural),
  };
}

export async function colorLinesRoutes(fastify: FastifyInstance): Promise<void> {
  // GET /shades — browse shades with optional filters
  fastify.get<{
    Querystring: ColorLineQuery;
    Reply: ApiResponse<ColorLine[]>;
  }>(
    '/shades',
    { preHandler: authenticate },
    async (request, reply) => {
      const { brand, level, tone } = request.query;

      try {
        let sql = `
          SELECT s.id, b.name as brand, pl.name as product_line,
                 s.shade_code, s.shade_name, s.level,
                 s.primary_tone as tone, s.rgb, s.is_natural
          FROM shades s
          JOIN brands b ON b.id = s.brand_id
          JOIN product_lines pl ON pl.id = s.product_line_id
          WHERE 1=1
        `;
        const params: unknown[] = [];
        let i = 1;

        if (brand) {
          sql += ` AND b.name ILIKE $${i++}`;
          params.push(`%${brand}%`);
        }
        if (level !== undefined) {
          sql += ` AND s.level = $${i++}`;
          params.push(level);
        }
        if (tone) {
          sql += ` AND s.primary_tone = $${i++}`;
          params.push(tone);
        }

        sql += ' ORDER BY b.name, s.level, s.primary_tone LIMIT 200';

        const result = await query(sql, params);
        const colorLines = result.rows.map(rowToColorLine);

        return reply.status(200).send({ success: true, data: colorLines });
      } catch (error) {
        fastify.log.error('Shades error: %s', error instanceof Error ? error.message : String(error));
        return reply.status(500).send({
          success: false,
          error: { code: 'DATABASE_ERROR', message: 'Failed to fetch shades' },
        });
      }
    }
  );

  // GET /shades/brands — list available brands
  fastify.get<{ Reply: ApiResponse<string[]> }>(
    '/shades/brands',
    { preHandler: authenticate },
    async (_request, reply) => {
      try {
        const result = await query(
          'SELECT DISTINCT b.name FROM brands b ORDER BY b.name'
        );
        return reply.status(200).send({
          success: true,
          data: result.rows.map((r) => String(r.name)),
        });
      } catch (error) {
        fastify.log.error('Brands error: %s', error instanceof Error ? error.message : String(error));
        return reply.status(500).send({
          success: false,
          error: { code: 'DATABASE_ERROR', message: 'Failed to fetch brands' },
        });
      }
    }
  );

  // GET /shades/:shadeCode — shade details
  fastify.get<{
    Params: { shadeCode: string };
    Reply: ApiResponse<ColorLine | null>;
  }>(
    '/shades/:shadeCode',
    { preHandler: authenticate },
    async (request, reply) => {
      const { shadeCode } = request.params;
      try {
        const result = await query(
          `SELECT s.id, b.name as brand, pl.name as product_line,
                  s.shade_code, s.shade_name, s.level,
                  s.primary_tone as tone, s.rgb, s.is_natural
           FROM shades s
           JOIN brands b ON b.id = s.brand_id
           JOIN product_lines pl ON pl.id = s.product_line_id
           WHERE s.shade_code ILIKE $1
           LIMIT 1`,
          [shadeCode]
        );
        if (result.rows.length === 0) {
          return reply.status(200).send({ success: true, data: null });
        }
        return reply.status(200).send({ success: true, data: rowToColorLine(result.rows[0]) });
      } catch (error) {
        fastify.log.error('Shade detail error: %s', error instanceof Error ? error.message : String(error));
        return reply.status(500).send({
          success: false,
          error: { code: 'DATABASE_ERROR', message: 'Failed to fetch shade' },
        });
      }
    }
  );
}